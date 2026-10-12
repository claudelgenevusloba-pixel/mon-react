import React, { useState } from "react";

import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  ClipboardCheck,
  FileText,
  LogIn,
} from "lucide-react";

import "./Login.css";

import { API_URL } from "../config/api";

function Login({ onConnexion }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  /**
   * =========================================================
   * CONNEXION
   * =========================================================
   */

  const gererConnexion = async (event) => {
    event.preventDefault();

    setErreur("");

    if (!email.trim()) {
      setErreur(
        "Veuillez saisir votre adresse e-mail."
      );
      return;
    }

    if (!motDePasse) {
      setErreur(
        "Veuillez saisir votre mot de passe."
      );
      return;
    }

    setChargement(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            mot_de_passe: motDePasse,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Adresse e-mail ou mot de passe incorrect."
        );
      }

      if (!data.token) {
        throw new Error(
          "Le serveur n'a pas retourné de token de connexion."
        );
      }

      /**
       * =====================================================
       * UTILISATEUR
       * =====================================================
       */

      const utilisateurAPI =
        data.utilisateur ||
        data.user ||
        data.data?.utilisateur ||
        data.data?.user ||
        data.data ||
        {};

      const roleAPI =
        utilisateurAPI?.role;

      const nomRole =
        typeof roleAPI === "object"
          ? (
              roleAPI?.nom ||
              roleAPI?.libelle ||
              ""
            )
          : (
              roleAPI ||
              utilisateurAPI?.nom_role ||
              ""
            );

      const utilisateurNormalise = {
        ...utilisateurAPI,
        role: nomRole,
      };

      /**
       * =====================================================
       * TOKEN
       * =====================================================
       */

      localStorage.setItem(
        "gain_office_token",
        data.token
      );

      localStorage.setItem(
        "token",
        data.token
      );

      /**
       * =====================================================
       * TRANSMISSION À APP
       * =====================================================
       */

      if (onConnexion) {
        onConnexion(
          utilisateurNormalise
        );
      }

    } catch (error) {
      console.error(
        "Erreur de connexion :",
        error
      );

      setErreur(
        error.message ||
          "Impossible de se connecter au serveur."
      );

    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* =================================================
            GAUCHE
        ================================================== */}

        <section className="login-left">

          <div className="login-brand">

            <div className="login-logo">
              <Building2
                size={40}
                strokeWidth={2.3}
              />
            </div>

            <div className="login-company">

              <span>
                GAIN OFFICE
              </span>

              <strong>
                Groupe GAIN SARL
              </strong>

            </div>

            <h1>
              ESPACE PROFESSIONNEL
            </h1>

            <p>
              Plateforme professionnelle
              de gestion administrative
              de Groupe GAIN SARL.
            </p>

            <div className="login-features">

              <div className="login-feature">

                <div className="login-feature-icon">
                  <Users size={18} />
                </div>

                <span>
                  Gestion des employés
                </span>

              </div>

              <div className="login-feature">

                <div className="login-feature-icon">
                  <ClipboardCheck
                    size={18}
                  />
                </div>

                <span>
                  Gestion des tâches
                </span>

              </div>

              <div className="login-feature">

                <div className="login-feature-icon">
                  <FileText size={18} />
                </div>

                <span>
                  Suivi des demandes
                </span>

              </div>

              <div className="login-feature">

                <div className="login-feature-icon">
                  <ShieldCheck
                    size={18}
                  />
                </div>

                <span>
                  Rapports et notifications
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            DROITE
        ================================================== */}

        <section className="login-right">

          <div className="login-card">

            <div className="login-card-header">

              <span className="login-welcome">
                GAIN OFFICE
              </span>

              <h2>
                Bienvenue
              </h2>

              <p>
                Connectez-vous à votre
                espace de gestion.
              </p>

            </div>

            <form
              className="login-form"
              onSubmit={gererConnexion}
            >

              {/* EMAIL */}

              <div className="login-field">

                <label htmlFor="email">
                  Adresse e-mail
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
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="exemple@gain.ci"
                    autoComplete="email"
                    disabled={chargement}
                    className="login-input"
                  />

                </div>

              </div>

              {/* MOT DE PASSE */}

              <div className="login-field">

                <label htmlFor="motDePasse">
                  Mot de passe
                </label>

                <div className="login-input-wrapper">

                  <LockKeyhole
                    className="login-input-icon"
                    size={18}
                  />

                  <input
                    id="motDePasse"
                    type={
                      voirMotDePasse
                        ? "text"
                        : "password"
                    }
                    value={motDePasse}
                    onChange={(event) =>
                      setMotDePasse(
                        event.target.value
                      )
                    }
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    disabled={chargement}
                    className="login-input password"
                  />

                  <button
                    type="button"
                    className="login-password-button"
                    onClick={() =>
                      setVoirMotDePasse(
                        !voirMotDePasse
                      )
                    }
                    tabIndex={-1}
                    aria-label={
                      voirMotDePasse
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {voirMotDePasse ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* ERREUR */}

              {erreur && (
                <div
                  className="login-error"
                  role="alert"
                >
                  {erreur}
                </div>
              )}

              {/* BOUTON */}

              <button
                type="submit"
                className="login-submit"
                disabled={chargement}
              >

                {chargement ? (
                  <>
                    <span className="login-spinner" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}

              </button>

            </form>

            <div className="login-security">

              <ShieldCheck size={15} />

              <span>
                Connexion sécurisée
              </span>

            </div>

            <div className="login-footer">
              © Groupe GAIN SARL 2026
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;