import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, LockKeyhole, ShieldAlert } from "lucide-react";
import "./ActivationCompte.css";
import { API_URL } from "../config/api";

export default function ActivationCompte() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const erreurInitiale = !token
    ? "Lien d'activation invalide."
    : !API_URL
      ? "Le service d'activation n'est pas configuré pour ce site. Contactez l'administrateur."
      : "";

  const [chargement, setChargement] = useState(Boolean(token && API_URL));
  const [activation, setActivation] = useState(false);

  const [invitation, setInvitation] = useState(null);
  const [erreur, setErreur] = useState(erreurInitiale);

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  /*
   * Informations personnelles complétées par l'employé.
   * Le rôle, le service, le poste et le matricule sont
   * réservés au RH et ne sont jamais modifiables ici.
   */
  const [emailPersonnel, setEmailPersonnel] = useState("");
  const [telephone, setTelephone] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");

  const [succes, setSucces] = useState(false);

  const verifierInvitation = useCallback(async (signal) => {
    try {
      const response = await fetch(
        `${API_URL}/invitations/${encodeURIComponent(token)}`,
        { headers: { Accept: "application/json" }, signal }
      );

      const resultat = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resultat.message || "Cette invitation n'est plus valide."
        );
      }

      if (!resultat.data?.email) {
        throw new Error("Le serveur a renvoyé une réponse invalide.");
      }

      setInvitation(resultat.data);

      /*
       * Pré-remplissage des informations personnelles
       * déjà connues par l'entreprise.
       */
      setEmailPersonnel(resultat.data?.email_personnel || "");
      setTelephone(resultat.data?.telephone || "");
      setDateNaissance(resultat.data?.date_naissance || "");
      setAdresse(resultat.data?.adresse || "");
      setVille(resultat.data?.ville || "");
    } catch (error) {
      if (error.name === "AbortError") return;
      setErreur(
        error instanceof TypeError
          ? "Impossible de joindre le serveur. Vérifiez que l'API est accessible et que CORS autorise ce site."
          : error.message || "Impossible de vérifier l'invitation."
      );
    } finally {
      if (!signal.aborted) setChargement(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !API_URL) return;

    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        verifierInvitation(controller.signal);
      }
    });

    return () => controller.abort();
  }, [token, verifierInvitation]);

  const activerCompte = async (event) => {
    event.preventDefault();

    setErreur("");

    if (!API_URL) {
      setErreur("Le service d'activation n'est pas configuré pour ce site.");
      return;
    }

    if (motDePasse.length < 8) {
      setErreur(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (motDePasse !== confirmation) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!emailPersonnel.trim()) {
      setErreur("Votre adresse e-mail personnelle est obligatoire.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPersonnel.trim())) {
      setErreur("Votre adresse e-mail personnelle est invalide.");
      return;
    }

    setActivation(true);

    try {
      const response = await fetch(
        `${API_URL}/invitations/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            password: motDePasse,
            password_confirmation: confirmation,
            email_personnel: emailPersonnel.trim().toLowerCase(),
            telephone: telephone.trim() || null,
            date_naissance: dateNaissance || null,
            adresse: adresse.trim() || null,
            ville: ville.trim() || null,
          }),
        }
      );

      const resultat = await response.json().catch(() => ({}));

      if (!response.ok) {
        const premiereErreur = Object.values(resultat.errors || {})
          .flat()
          .find(Boolean);
        throw new Error(
          premiereErreur || resultat.message || "Impossible d'activer le compte."
        );
      }

      if (resultat.data?.statut !== "actif") {
        throw new Error("Le serveur n'a pas confirmé l'activation du compte.");
      }

      setSucces(true);
    } catch (error) {
      setErreur(
        error instanceof TypeError
          ? "Impossible de joindre le serveur. Vérifiez votre connexion et la configuration CORS."
          : error.message || "Une erreur est survenue."
      );
    } finally {
      setActivation(false);
    }
  };

  if (chargement) {
    return (
      <div className="activation-page">
        <div className="activation-card activation-loading">
          <LoaderCircle className="activation-spinner" size={42} />

          <h2>Vérification de votre invitation...</h2>

          <p>
            Veuillez patienter pendant que nous vérifions votre
            lien d'activation.
          </p>
        </div>
      </div>
    );
  }

  if (erreur && !invitation) {
    return (
      <div className="activation-page">
        <div className="activation-card">
          <div className="activation-icon activation-icon-error">
            <ShieldAlert size={42} />
          </div>

          <h1>Activation indisponible</h1>

          <p className="activation-description">
            {erreur}
          </p>

          <button
            type="button"
            className="activation-button"
            onClick={() => navigate("/login")}
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  if (succes) {
    return (
      <div className="activation-page">
        <div className="activation-card">
          <div className="activation-icon activation-icon-success">
            <CheckCircle2 size={46} />
          </div>

          <h1>Compte activé !</h1>

          <p className="activation-description">
            Votre compte GAIN OFFICE a été activé avec succès.
          </p>

          <p className="activation-email">
            Vous pouvez maintenant vous connecter avec :
          </p>

          <strong className="activation-user-email">
            {invitation?.email}
          </strong>

          <button
            type="button"
            className="activation-button"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="activation-page">
      <div className="activation-card activation-form-card">
        <div className="activation-brand">
          <div className="activation-logo">
            G
          </div>

          <div>
            <strong>GAIN OFFICE</strong>
            <span>Gestion professionnelle</span>
          </div>
        </div>

        <div className="activation-icon activation-icon-success">
          <LockKeyhole size={40} />
        </div>

        <h1>Activez votre compte</h1>

        <p className="activation-description">
          Bienvenue{" "}
          <strong>
            {invitation?.prenom} {invitation?.nom}
          </strong>
          .
        </p>

        <p className="activation-description">
          Votre compte professionnel GAIN OFFICE a été créé par
          l'administration.
        </p>

        <div className="activation-email-box">
          <span>Adresse e-mail</span>
          <strong>{invitation?.email}</strong>
        </div>

        {erreur && (
          <div className="activation-error">
            <ShieldAlert size={18} />
            <span>{erreur}</span>
          </div>
        )}

        <form onSubmit={activerCompte}>
          <div className="activation-field">
            <label>E-mail personnel *</label>

            <input
              type="email"
              value={emailPersonnel}
              onChange={(event) =>
                setEmailPersonnel(event.target.value)
              }
              placeholder="votre.adresse@personnelle.com"
              required
            />
          </div>

          <div className="activation-field">
            <label>Téléphone personnel</label>

            <input
              type="tel"
              value={telephone}
              onChange={(event) =>
                setTelephone(event.target.value)
              }
              placeholder="+225 07 00 00 00 00"
            />
          </div>

          <div className="activation-field">
            <label>Date de naissance</label>

            <input
              type="date"
              value={dateNaissance}
              onChange={(event) =>
                setDateNaissance(event.target.value)
              }
            />
          </div>

          <div className="activation-field">
            <label>Adresse</label>

            <input
              type="text"
              value={adresse}
              onChange={(event) =>
                setAdresse(event.target.value)
              }
              placeholder="Quartier, ville..."
            />
          </div>

          <div className="activation-field">
            <label>Ville</label>

            <input
              type="text"
              value={ville}
              onChange={(event) =>
                setVille(event.target.value)
              }
              placeholder="Votre ville"
            />
          </div>

          <div className="activation-field">
            <label>Nouveau mot de passe</label>

            <input
              type="password"
              value={motDePasse}
              onChange={(event) =>
                setMotDePasse(event.target.value)
              }
              placeholder="Minimum 8 caractères"
              minLength={8}
              required
            />
          </div>

          <div className="activation-field">
            <label>Confirmer le mot de passe</label>

            <input
              type="password"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              placeholder="Répétez votre mot de passe"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="activation-button"
            disabled={activation}
          >
            {activation ? (
              <>
                <LoaderCircle
                  size={18}
                  className="activation-spinner-small"
                />
                Activation...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Activer mon compte
              </>
            )}
          </button>
        </form>

        <div className="activation-security">
          <LockKeyhole size={16} />

          <span>
            Votre mot de passe est sécurisé et ne sera jamais
            transmis par WhatsApp.
          </span>
        </div>
      </div>
    </div>
  );
}
