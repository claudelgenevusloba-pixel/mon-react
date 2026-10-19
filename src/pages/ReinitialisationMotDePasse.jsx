import React, { useState } from "react";
import { ArrowLeft, KeyRound, Save } from "lucide-react";
import "./Login.css";
import { API_URL } from "../config/api";

/**
 * Page « Réinitialisation du mot de passe » :
 * ouverte depuis l'e-mail (token + email dans l'URL).
 */
function ReinitialisationMotDePasse() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState(null);
  const [reussite, setReussite] = useState(false);

  const lienInvalide = !token || !email;

  const gererEnvoi = async (event) => {
    event.preventDefault();

    if (motDePasse.length < 8) {
      setMessage({
        type: "erreur",
        texte: "Le mot de passe doit contenir au moins 8 caractères.",
      });
      return;
    }

    if (motDePasse !== confirmation) {
      setMessage({
        type: "erreur",
        texte: "Les deux mots de passe ne correspondent pas.",
      });
      return;
    }

    setChargement(true);
    setMessage(null);

    try {
      const reponse = await fetch(
        `${API_URL}/mot-de-passe-reinitialise`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
            email,
            mot_de_passe: motDePasse,
            mot_de_passe_confirmation: confirmation,
          }),
        }
      );

      const data = await reponse.json().catch(() => ({}));

      if (!reponse.ok) {
        setMessage({
          type: "erreur",
          texte: data.message || "Le lien est invalide ou a expiré.",
        });
        return;
      }

      setReussite(true);
      setMessage({
        type: "succes",
        texte: data.message || "Mot de passe réinitialisé avec succès.",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch {
      setMessage({
        type: "erreur",
        texte: "Impossible de joindre le serveur. Vérifiez votre connexion.",
      });
    } finally {
      setChargement(false);
    }
  };

  const styleLien = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    marginTop: "18px",
    color: "#1677d2",
    fontSize: "14px",
    textDecoration: "none",
  };

  const styleSucces = {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "14px",
  };

  const champMotDePasse = (id, label, valeur, setValeur, placeholder) => (
    <div className="login-field">
      <label htmlFor={id}>{label}</label>
      <div className="login-input-wrapper">
        <KeyRound className="login-input-icon" size={18} />
        <input
          id={id}
          type="password"
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          disabled={chargement || reussite}
          className="login-input"
        />
      </div>
    </div>
  );

  const renduFormulaire = () => (
    <form className="login-form" onSubmit={gererEnvoi}>
      <div className="login-field">
        <label htmlFor="email">Adresse e-mail</label>
        <div className="login-input-wrapper">
          <KeyRound className="login-input-icon" size={18} />
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            disabled
            className="login-input"
          />
        </div>
      </div>

      {champMotDePasse(
        "motDePasse",
        "Nouveau mot de passe",
        motDePasse,
        setMotDePasse,
        "8 caractères minimum"
      )}

      {champMotDePasse(
        "confirmation",
        "Confirmer le mot de passe",
        confirmation,
        setConfirmation,
        "Retapez le mot de passe"
      )}

      {message && message.type === "erreur" && (
        <div className="login-error">{message.texte}</div>
      )}

      {message && message.type === "succes" && (
        <div style={styleSucces}>{message.texte}</div>
      )}

      <button
        type="submit"
        className="login-submit"
        disabled={chargement || reussite}
      >
        <Save size={16} />
        {chargement ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </button>
    </form>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <section className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <span className="login-welcome">GAIN OFFICE</span>
              <h2>Nouveau mot de passe</h2>
              <p>Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            {lienInvalide ? (
              <div className="login-error">
                Lien de réinitialisation invalide. Veuillez utiliser le lien
                reçu par e-mail.
              </div>
            ) : (
              renduFormulaire()
            )}

            <a href="/login" style={styleLien}>
              <ArrowLeft size={14} />
              Retour à la connexion
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ReinitialisationMotDePasse;
