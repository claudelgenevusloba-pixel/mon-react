import { useEffect, useState } from "react";

import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";

import { PERMISSIONS } from "../config/permissions";
import { aPermission, getRole } from "../config/access";
import { ROLES } from "../config/roles";
import { useAuth } from "../context/AuthContext";

import "./Parametres.css";

import { API_URL } from "../config/api";

const PARAMETRES_PAR_DEFAUT = {
  notificationsEmail: true,
  notificationsApplication: true,
  notificationsTaches: true,
  notificationsDemandes: true,
  notificationsMessages: true,
  langue: "Français",
  formatDate: "DD/MM/YYYY",
  afficherPhoto: true,
};

function obtenirToken() {
  return (
    localStorage.getItem("gain_office_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function obtenirIdUtilisateur(utilisateur) {
  return (
    utilisateur?.id_utilisateur ||
    utilisateur?.id ||
    utilisateur?.utilisateur?.id_utilisateur ||
    utilisateur?.utilisateur?.id ||
    "local"
  );
}

function Parametres({ utilisateur }) {
  const idUtilisateur = obtenirIdUtilisateur(utilisateur);

  const role = getRole(utilisateur);

  const peutVoirParametres = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_PARAMETRES
  );

  const peutModifierParametres = aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_PARAMETRES
  );

  const peutModifierEntreprise =
    role === ROLES.RH ||
    role === ROLES.ADMINISTRATEUR;

  const { setUtilisateur } = useAuth();

  const [onglet, setOnglet] = useState("profil");

  const [parametres, setParametres] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(
        `gainOfficeParametres_${idUtilisateur}`
      );

      if (sauvegarde) {
        return {
          ...PARAMETRES_PAR_DEFAUT,
          ...JSON.parse(sauvegarde),
        };
      }
    } catch (error) {
      console.error(
        "Erreur de lecture des paramètres :",
        error
      );
    }

    return PARAMETRES_PAR_DEFAUT;
  });

  const [profil, setProfil] = useState({
    nom:
      utilisateur?.nom ||
      utilisateur?.prenomNom ||
      "Utilisateur GAIN OFFICE",

    prenom:
      utilisateur?.prenom ||
      "",

    email:
      utilisateur?.email ||
      "",

    telephone:
      utilisateur?.telephone ||
      "",

    fonction:
      utilisateur?.role?.nom ||
      utilisateur?.role ||
      "Employé",
  });

  const [entreprise, setEntreprise] = useState({
    nom: "Groupe GAIN SARL",
    email: "",
    telephone: "",
    adresse: "Abidjan, Côte d'Ivoire",
  });

  /*
   * Configuration des rapports périodiques.
   * Valeurs stockées côté Laravel (parametre_entreprises).
   * periodicite vide = aucune périodicité imposée.
   */
  const [configRapports, setConfigRapports] =
    useState({
      periodicite_rapports: "",
      delai_soumission_rapports: "",
      rappels_rapports: true,
      niveaux_validation_rapports: 1,
    });

  const [motDePasse, setMotDePasse] = useState({
    ancien: "",
    nouveau: "",
    confirmation: "",
  });

  const [afficherAncien, setAfficherAncien] =
    useState(false);

  const [afficherNouveau, setAfficherNouveau] =
    useState(false);

  const [afficherConfirmation, setAfficherConfirmation] =
    useState(false);

  const [message, setMessage] = useState("");

  const [typeMessage, setTypeMessage] =
    useState("success");

  const [chargementMotDePasse, setChargementMotDePasse] =
    useState(false);

  const [chargementProfil, setChargementProfil] = useState(false);

  useEffect(() => {
    try {
      const sauvegardeProfil = localStorage.getItem(
        `gainOfficeProfil_${idUtilisateur}`
      );

      if (sauvegardeProfil) {
        setProfil((ancien) => ({
          ...ancien,
          ...JSON.parse(sauvegardeProfil),
        }));
      }

      const sauvegardeEntreprise =
        localStorage.getItem(
          "gainOfficeEntreprise"
        );

      if (sauvegardeEntreprise) {
        setEntreprise((ancien) => ({
          ...ancien,
          ...JSON.parse(sauvegardeEntreprise),
        }));
      }
    } catch (error) {
      console.error(
        "Erreur de chargement des paramètres :",
        error
      );
    }
  }, [idUtilisateur]);

  useEffect(() => {
    setProfil((ancien) => ({
      ...ancien,

      nom:
        utilisateur?.nom ||
        utilisateur?.prenomNom ||
        ancien.nom,

      prenom:
        utilisateur?.prenom ||
        ancien.prenom,

      email:
        utilisateur?.email ||
        ancien.email,

      telephone:
        utilisateur?.telephone ||
        ancien.telephone,

      fonction:
        utilisateur?.role?.nom ||
        utilisateur?.role ||
        ancien.fonction,
    }));
  }, [utilisateur]);

  const afficherMessage = (
    texte,
    type = "success"
  ) => {
    setMessage(texte);
    setTypeMessage(type);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const modifierParametre = (
    champ,
    valeur
  ) => {
    setParametres((ancien) => ({
      ...ancien,
      [champ]: valeur,
    }));
  };

  const sauvegarderParametres = () => {
    try {
      localStorage.setItem(
        `gainOfficeParametres_${idUtilisateur}`,
        JSON.stringify(parametres)
      );

      afficherMessage(
        "Vos préférences ont été enregistrées."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        "Impossible d'enregistrer vos préférences.",
        "error"
      );
    }
  };

    const sauvegarderProfil = async () => {
    // Validation côté frontend du format e-mail.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profil.email)) {
      afficherMessage(
        "Veuillez saisir une adresse e-mail valide.",
        "error"
      );
      return;
    }

    const token = obtenirToken();

    if (!token) {
      afficherMessage(
        "Votre session n'est plus valide. Veuillez vous reconnecter.",
        "error"
      );
      return;
    }

    setChargementProfil(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/profil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom: profil.nom,
            prenom: profil.prenom,
            email: profil.email,
            telephone: profil.telephone || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.errors?.email?.[0] ||
            "Impossible d'enregistrer le profil."
        );
      }

      // Mise à jour du contexte auth (localStorage + état React)
      // pour que le nouvel e-mail soit immédiatement visible partout.
      if (data.utilisateur) {
        setUtilisateur(data.utilisateur);
      }

      // Conserve aussi une copie dans le localStorage dédié (cache).
      try {
        localStorage.setItem(
          `gainOfficeProfil_${idUtilisateur}`,
          JSON.stringify({
            ...profil,
            nom: data.utilisateur?.nom || profil.nom,
            prenom: data.utilisateur?.prenom || profil.prenom,
            email: data.utilisateur?.email || profil.email,
            telephone: data.utilisateur?.telephone || profil.telephone,
          })
        );
      } catch (error) {
        console.error(error);
      }

      afficherMessage(
        "Votre profil a été mis à jour avec succès."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        error.message ||
          "Erreur lors de l'enregistrement du profil.",
        "error"
      );
    } finally {
      setChargementProfil(false);
    }
  };

  /*
   * Chargement de la configuration rapports
   * depuis Laravel (parametre_entreprises).
   */
  const [nomEntrepriseApi, setNomEntrepriseApi] =
    useState(null);

  useEffect(() => {
    const chargerConfigRapports = async () => {
      const accessToken =
        localStorage.getItem("gain_office_token") ||
        localStorage.getItem("token") ||
        "";

      if (!accessToken) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/parametres`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        const params = data?.parametres;

        if (params) {
          setNomEntrepriseApi(
            params.nom_entreprise || null
          );

          setConfigRapports({
            periodicite_rapports:
              params.periodicite_rapports || "",

            delai_soumission_rapports:
              params.delai_soumission_rapports ?? "",

            rappels_rapports:
              params.rappels_rapports ?? true,

            niveaux_validation_rapports:
              params.niveaux_validation_rapports ?? 1,
          });
        }
      } catch (error) {
        console.error(
          "Erreur chargement config rapports :",
          error
        );
      }
    };

    chargerConfigRapports();
  }, []);

  const sauvegarderEntreprise = () => {
    if (!peutModifierEntreprise) {
      afficherMessage(
        "Vous n'avez pas l'autorisation de modifier les paramètres de l'entreprise.",
        "error"
      );

      return;
    }

    try {
      localStorage.setItem(
        "gainOfficeEntreprise",
        JSON.stringify(entreprise)
      );

      afficherMessage(
        "Les informations de l'entreprise ont été enregistrées."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        "Erreur lors de l'enregistrement de l'entreprise.",
        "error"
      );
    }
  };

  /*
   * Sauvegarde de la configuration des rapports
   * périodiques "” stockée dans Laravel, utilisée par
   * le circuit hiérarchique (échéances, rappels,
   * niveaux de validation).
   */
  const sauvegarderRapports = async () => {
    if (!peutModifierEntreprise) {
      afficherMessage(
        "Vous n'avez pas l'autorisation de modifier ces paramètres.",
        "error"
      );

      return;
    }

    const accessToken =
      localStorage.getItem("gain_office_token") ||
      localStorage.getItem("token") ||
      "";

    try {
      const response = await fetch(
        `${API_URL}/parametres`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            /* Requis par l'API : on préserve la valeur en base */
            nom_entreprise:
              nomEntrepriseApi ||
              entreprise.nom ||
              "GAIN OFFICE",

            periodicite_rapports:
              configRapports.periodicite_rapports ||
              null,

            delai_soumission_rapports:
              configRapports.delai_soumission_rapports ===
                "" ||
              configRapports.delai_soumission_rapports ===
                null
                ? null
                : Number(
                    configRapports.delai_soumission_rapports
                  ),

            rappels_rapports:
              Boolean(
                configRapports.rappels_rapports
              ),

            niveaux_validation_rapports: Number(
              configRapports.niveaux_validation_rapports ||
                1
            ),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible d'enregistrer la configuration des rapports."
        );
      }

      afficherMessage(
        "La configuration des rapports a été enregistrée."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        error.message ||
          "Erreur lors de l'enregistrement de la configuration.",
        "error"
      );
    }
  };

  const changerMotDePasse = async () => {
    if (
      !motDePasse.ancien ||
      !motDePasse.nouveau ||
      !motDePasse.confirmation
    ) {
      afficherMessage(
        "Veuillez remplir tous les champs du mot de passe.",
        "error"
      );

      return;
    }

    if (motDePasse.nouveau.length < 8) {
      afficherMessage(
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        "error"
      );

      return;
    }

    if (
      motDePasse.nouveau !==
      motDePasse.confirmation
    ) {
      afficherMessage(
        "Les deux nouveaux mots de passe ne correspondent pas.",
        "error"
      );

      return;
    }

    const token = obtenirToken();

    if (!token) {
      afficherMessage(
        "Votre session n'est plus valide. Veuillez vous reconnecter.",
        "error"
      );

      return;
    }

    setChargementMotDePasse(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ancien_mot_de_passe:
              motDePasse.ancien,

            nouveau_mot_de_passe:
              motDePasse.nouveau,

            nouveau_mot_de_passe_confirmation:
              motDePasse.confirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de modifier le mot de passe."
        );
      }

      setMotDePasse({
        ancien: "",
        nouveau: "",
        confirmation: "",
      });

      afficherMessage(
        "Mot de passe modifié avec succès."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        error.message ||
          "Erreur lors de la modification du mot de passe.",
        "error"
      );
    } finally {
      setChargementMotDePasse(false);
    }
  };

  const reinitialiserParametres = () => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment réinitialiser vos préférences personnelles ?"
    );

    if (!confirmation) {
      return;
    }

    setParametres({
      ...PARAMETRES_PAR_DEFAUT,
    });

    try {
      localStorage.setItem(
        `gainOfficeParametres_${idUtilisateur}`,
        JSON.stringify(PARAMETRES_PAR_DEFAUT)
      );

      afficherMessage(
        "Vos préférences ont été réinitialisées."
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        "Impossible de réinitialiser les préférences.",
        "error"
      );
    }
  };

  const onglets = [
    {
      id: "profil",
      label: "Mon profil",
      icon: User,
    },

    {
      id: "securite",
      label: "Sécurité",
      icon: Shield,
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "apparence",
      label: "Préférences",
      icon: User,
    },
  ];

  if (peutModifierEntreprise) {
    onglets.push({
      id: "entreprise",
      label: "Entreprise",
      icon: Building2,
    });
  }

  if (!peutVoirParametres) {
    return (
      <div className="settings-page">
        <div className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-icon">
              <Shield size={20} />
            </div>

            <div>
              <h2>Accès refusé</h2>

              <p>
                Vous n'avez pas l'autorisation
                d'accéder aux paramètres.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
    return (
    <div className="settings-page">

      <div className="settings-header">

        <div>

          <div className="settings-breadcrumb">
            <span>GAIN OFFICE</span>
            <span>/</span>
            <strong>Paramètres</strong>
          </div>

          <h1>Paramètres</h1>

          <p>
            Gérez votre profil, votre sécurité et
            vos préférences personnelles.
          </p>

        </div>

        {peutModifierParametres && (
          <button
            className="settings-save-button"
            onClick={sauvegarderParametres}
          >
            <Save size={18} />
            Enregistrer
          </button>
        )}

      </div>

      {message && (
        <div
          className={`settings-toast ${typeMessage}`}
        >
          {typeMessage === "success" ? (
            <Check size={18} />
          ) : (
            <X size={18} />
          )}

          <span>{message}</span>
        </div>
      )}

      <div className="settings-layout">

        <aside className="settings-sidebar">

          <div className="settings-sidebar-title">
            PARAMÈTRES
          </div>

          <nav>

            {onglets.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    `settings-nav-item ${
                      onglet === item.id
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setOnglet(item.id)
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}

          </nav>

          <button
            type="button"
            className="settings-reset-button"
            onClick={reinitialiserParametres}
          >
            Réinitialiser mes préférences
          </button>

        </aside>

        <main className="settings-content">

          {onglet === "profil" && (
            <section className="settings-section">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  <User size={20} />
                </div>

                <div>
                  <h2>Mon profil</h2>

                  <p>
                    Gérez les informations
                    associées à votre compte.
                  </p>
                </div>

              </div>

              <div className="profile-card">

                <div className="profile-avatar">
                  {profil.nom
                    ?.split(" ")
                    .filter(Boolean)
                    .map((mot) => mot[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{profil.nom}</h3>

                  <p>{profil.fonction}</p>

                  <span>{profil.email}</span>
                </div>

              </div>

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Nom complet
                  </label>

                  <input
                    type="text"
                    value={profil.nom}
                    onChange={(e) =>
                      setProfil({
                        ...profil,
                        nom: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Prénom
                  </label>

                  <input
                    type="text"
                    placeholder="Ex. Jean"
                    value={profil.prenom}
                    onChange={(e) =>
                      setProfil({
                        ...profil,
                        prenom: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Adresse e-mail
                  </label>

                  <input
                    type="email"
                    value={profil.email}
                    onChange={(e) =>
                      setProfil({
                        ...profil,
                        email: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Téléphone
                  </label>

                  <input
                    type="text"
                    placeholder="Ex. 07 00 00 00 00"
                    value={profil.telephone}
                    onChange={(e) =>
                      setProfil({
                        ...profil,
                        telephone: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Fonction
                  </label>

                  <input
                    type="text"
                    value={profil.fonction}
                    disabled
                  />

                </div>

              </div>

              <div className="settings-actions">

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={sauvegarderProfil}
                >
                  <Save size={17} />
                  Enregistrer le profil
                </button>

              </div>

            </section>
          )}

          {onglet === "securite" && (
            <section className="settings-section">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  <Shield size={20} />
                </div>

                <div>
                  <h2>Sécurité</h2>

                  <p>
                    Protégez votre compte et
                    gérez votre mot de passe.
                  </p>
                </div>

              </div>

              <div className="security-notice">

                <Lock size={20} />

                <div>

                  <strong>
                    Sécurité du compte
                  </strong>

                  <p>
                    Votre mot de passe doit être
                    suffisamment long et difficile
                    à deviner.
                  </p>

                </div>

              </div>

              <div className="password-form">

                <div className="settings-field">

                  <label>
                    Mot de passe actuel
                  </label>

                  <div className="password-input">

                    <input
                      type={
                        afficherAncien
                          ? "text"
                          : "password"
                      }
                      value={motDePasse.ancien}
                      onChange={(e) =>
                        setMotDePasse({
                          ...motDePasse,
                          ancien:
                            e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAfficherAncien(
                          !afficherAncien
                        )
                      }
                    >
                      {afficherAncien ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                <div className="settings-field">

                  <label>
                    Nouveau mot de passe
                  </label>

                  <div className="password-input">

                    <input
                      type={
                        afficherNouveau
                          ? "text"
                          : "password"
                      }
                      value={motDePasse.nouveau}
                      onChange={(e) =>
                        setMotDePasse({
                          ...motDePasse,
                          nouveau:
                            e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAfficherNouveau(
                          !afficherNouveau
                        )
                      }
                    >
                      {afficherNouveau ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                <div className="settings-field">

                  <label>
                    Confirmer le nouveau
                    mot de passe
                  </label>

                  <div className="password-input">

                    <input
                      type={
                        afficherConfirmation
                          ? "text"
                          : "password"
                      }
                      value={
                        motDePasse.confirmation
                      }
                      onChange={(e) =>
                        setMotDePasse({
                          ...motDePasse,
                          confirmation:
                            e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAfficherConfirmation(
                          !afficherConfirmation
                        )
                      }
                    >
                      {afficherConfirmation ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

              </div>

              <div className="settings-actions">

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={changerMotDePasse}
                  disabled={chargementMotDePasse}
                >
                  <Lock size={17} />

                  {chargementMotDePasse
                    ? "Modification..."
                    : "Modifier le mot de passe"}
                </button>

              </div>

            </section>
          )}
                    {onglet === "notifications" && (
            <section className="settings-section">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  <Bell size={20} />
                </div>

                <div>
                  <h2>Notifications</h2>

                  <p>
                    Choisissez les notifications
                    que vous souhaitez recevoir.
                  </p>
                </div>

              </div>

              <div className="settings-options">

                <div className="settings-option">

                  <div>
                    <strong>
                      Notifications par e-mail
                    </strong>

                    <span>
                      Recevoir les notifications
                      importantes par e-mail.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.notificationsEmail
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "notificationsEmail",
                        !parametres.notificationsEmail
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

                <div className="settings-option">

                  <div>
                    <strong>
                      Notifications de
                      l'application
                    </strong>

                    <span>
                      Afficher les notifications
                      directement dans GAIN OFFICE.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.notificationsApplication
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "notificationsApplication",
                        !parametres.notificationsApplication
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

                <div className="settings-option">

                  <div>
                    <strong>
                      Notifications des tâches
                    </strong>

                    <span>
                      Recevoir les changements
                      concernant vos tâches.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.notificationsTaches
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "notificationsTaches",
                        !parametres.notificationsTaches
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

                <div className="settings-option">

                  <div>
                    <strong>
                      Notifications des demandes
                    </strong>

                    <span>
                      Ître informé des nouvelles
                      demandes et décisions.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.notificationsDemandes
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "notificationsDemandes",
                        !parametres.notificationsDemandes
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

                <div className="settings-option">

                  <div>
                    <strong>
                      Notifications des messages
                    </strong>

                    <span>
                      Recevoir les notifications
                      lorsqu'un message est reçu.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.notificationsMessages
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "notificationsMessages",
                        !parametres.notificationsMessages
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-actions">

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={sauvegarderParametres}
                >
                  <Save size={17} />
                  Enregistrer les préférences
                </button>

              </div>

            </section>
          )}

          {onglet === "apparence" && (
            <section className="settings-section">

              <div className="settings-section-header">

                <div className="settings-section-icon">
                  <User size={20} />
                </div>

                <div>
                  <h2>Préférences</h2>

                  <p>
                    Personnalisez vos préférences
                    personnelles dans GAIN OFFICE.
                  </p>
                </div>

              </div>

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Langue
                  </label>

                  <select
                    value={parametres.langue}
                    onChange={(e) =>
                      modifierParametre(
                        "langue",
                        e.target.value
                      )
                    }
                  >
                    <option value="Français">
                      Français
                    </option>

                    <option value="English">
                      English
                    </option>
                  </select>

                </div>

                <div className="settings-field">

                  <label>
                    Format de date
                  </label>

                  <select
                    value={
                      parametres.formatDate
                    }
                    onChange={(e) =>
                      modifierParametre(
                        "formatDate",
                        e.target.value
                      )
                    }
                  >
                    <option value="DD/MM/YYYY">
                      DD/MM/YYYY
                    </option>

                    <option value="MM/DD/YYYY">
                      MM/DD/YYYY
                    </option>

                    <option value="YYYY-MM-DD">
                      YYYY-MM-DD
                    </option>
                  </select>

                </div>

              </div>

              <div className="settings-options">

                <div className="settings-option">

                  <div>
                    <strong>
                      Afficher ma photo
                    </strong>

                    <span>
                      Autoriser l'affichage de
                      votre avatar dans votre
                      espace personnel.
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      `settings-switch ${
                        parametres.afficherPhoto
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      modifierParametre(
                        "afficherPhoto",
                        !parametres.afficherPhoto
                      )
                    }
                  >
                    <span />
                  </button>

                </div>

              </div>

              <div className="settings-actions">

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={sauvegarderParametres}
                >
                  <Save size={17} />
                  Enregistrer mes préférences
                </button>

              </div>

            </section>
          )}
                    {onglet === "entreprise" &&
            peutModifierEntreprise && (
              <section className="settings-section">

                <div className="settings-section-header">

                  <div className="settings-section-icon">
                    <Building2 size={20} />
                  </div>

                  <div>
                    <h2>Entreprise</h2>

                    <p>
                      Gérez les informations
                      générales de Groupe GAIN SARL.
                    </p>
                  </div>

                </div>

                <div className="settings-form-grid">

                  <div className="settings-field">

                    <label>
                      Nom de l'entreprise
                    </label>

                    <input
                      type="text"
                      value={entreprise.nom}
                      onChange={(e) =>
                        setEntreprise({
                          ...entreprise,
                          nom: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={entreprise.email}
                      onChange={(e) =>
                        setEntreprise({
                          ...entreprise,
                          email: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      Téléphone
                    </label>

                    <input
                      type="text"
                      value={
                        entreprise.telephone
                      }
                      onChange={(e) =>
                        setEntreprise({
                          ...entreprise,
                          telephone:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      Adresse
                    </label>

                    <input
                      type="text"
                      value={
                        entreprise.adresse
                      }
                      onChange={(e) =>
                        setEntreprise({
                          ...entreprise,
                          adresse:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

                <div className="settings-actions">

                  <button
                    type="button"
                    className="settings-primary-button"
                    onClick={
                      sauvegarderEntreprise
                    }
                  >
                    <Save size={17} />
                    Enregistrer l'entreprise
                  </button>

                </div>

              </section>
            )}

            {/* ========================================================
                RAPPORTS PÉRIODIQUES
            ======================================================== */}

            {onglet === "entreprise" &&
              peutModifierEntreprise && (
              <section className="settings-section">

                <div className="settings-section-header">

                  <div className="settings-section-icon">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2>Rapports périodiques</h2>

                    <p>
                      Périodicité, échéances, rappels
                      et circuit de validation des
                      rapports.
                    </p>
                  </div>

                </div>

                <div className="settings-form-grid">

                  <div className="settings-field">

                    <label>
                      Périodicité des rapports
                    </label>

                    <select
                      value={
                        configRapports.periodicite_rapports
                      }
                      onChange={(e) =>
                        setConfigRapports({
                          ...configRapports,
                          periodicite_rapports:
                            e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Non définie (aucune imposée)
                      </option>

                      <option value="quotidienne">
                        Quotidienne
                      </option>

                      <option value="hebdomadaire">
                        Hebdomadaire
                      </option>

                      <option value="mensuelle">
                        Mensuelle
                      </option>

                    </select>

                  </div>

                  <div className="settings-field">

                    <label>
                      Délai de soumission (jours après
                      la fin de période)
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={
                        configRapports.delai_soumission_rapports
                      }
                      onChange={(e) =>
                        setConfigRapports({
                          ...configRapports,
                          delai_soumission_rapports:
                            e.target.value,
                        })
                      }
                      placeholder="Ex. : 2"
                    />

                  </div>

                  <div className="settings-field">

                    <label>
                      Niveaux de validation
                    </label>

                    <select
                      value={
                        configRapports.niveaux_validation_rapports
                      }
                      onChange={(e) =>
                        setConfigRapports({
                          ...configRapports,
                          niveaux_validation_rapports:
                            e.target.value,
                        })
                      }
                    >
                      <option value="1">
                        1 "” Superior direct uniquement
                      </option>

                      <option value="2">
                        2 "” Supérieur direct + niveau suivant
                      </option>

                      <option value="3">
                        3 niveaux
                      </option>

                    </select>

                  </div>

                  <div className="settings-field">

                    <label>
                      Rappels d'échéance
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          configRapports.rappels_rapports
                        }
                        onChange={(e) =>
                          setConfigRapports({
                            ...configRapports,
                            rappels_rapports:
                              e.target.checked,
                          })
                        }
                      />

                      Notifier les rapports en retard
                    </label>

                  </div>

                </div>

                <div className="settings-actions">

                  <button
                    type="button"
                    className="settings-primary-button"
                    onClick={sauvegarderRapports}
                  >
                    <Save size={17} />
                    Enregistrer la configuration
                  </button>

                </div>

              </section>
            )}

        </main>

      </div>

    </div>
  );
}

export default Parametres;
