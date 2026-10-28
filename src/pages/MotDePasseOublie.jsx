import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

import { ArrowLeft, Mail, Send } from "lucide-react";

import "../styles/pages/login.css";

import { API_URL } from "../config/api";
import api from "../config/apiClient";

/**
 * Page « Mot de passe oublié » :
 * demande l'adresse e-mail et déclenche l'envoi du lien
 * de réinitialisation (message générique côté serveur).
 */
function MotDePasseOublie() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState(null);

  const gererEnvoi = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setMessage({
        type: "erreur",
        texte: "Veuillez saisir votre adresse e-mail.",
      });
      return;
    }

    setChargement(true);
    setMessage(null);

    try {
      const response = await api.post("/mot-de-passe-oublie", {
        email: email.trim(),
      });

      const data = response.data || {};

      setMessage({
        type: "succes",
        texte:
          data.message ||
          "Demande enregistrée.",
      });
      setEmail("");
    } catch (error) {
      const data = error?.response?.data || {};
      setMessage({
        type: "erreur",
        texte:
          data.message ||
          "Une erreur est survenue. Réessayez.",
      });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <section className="login-right">
          <div className="login-card">
            <div className="login-card-header">
              <span className="login-welcome">
                {t("GAIN OFFICE")}
              </span>

              <h2>{t("Mot de passe oublié")}</h2>

              <p>
                {t("Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.")}
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={gererEnvoi}
            >
              <div className="login-field">
                <label htmlFor="email">
                  {t("Adresse e-mail")}
                </label>

                <div className="login-input-wrapper">
                  <Mail
                    className="login-input-icon"
                    size={18}
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder={t("exemple@gain.ci")}
                    autoComplete="email"
                    disabled={chargement}
                    className="login-input"
                  />
                </div>
              </div>

              {message && message.type === "erreur" && (
                <div className="login-error">
                  {message.texte}
                </div>
              )}

              {message && message.type === "succes" && (
                <div
                  style={{
                    background: "#ecfdf5",
                    color: "#047857",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    fontSize: "14px",
                  }}
                >
                  {message.texte}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={chargement}
              >
                <Send size={16} />
                {chargement
                  ? "Envoi en cours..."
                  : "Envoyer le lien"}
              </button>

              <a
                href="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                  marginTop: "18px",
                  color: "#1677d2",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={14} />
                {t("Retour à la connexion")}
              </a>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MotDePasseOublie;
