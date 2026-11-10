import {
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employes from "./pages/Employes";
import Taches from "./pages/Taches";
import Demandes from "./pages/Demandes";
import Parametres from "./pages/Parametres";
import Rapports from "./pages/Rapports";
import HistoriqueActions from "./pages/HistoriqueActions";
import Page404 from "./pages/page404";
import { AccessDenied, RoutePermission } from "./components/routing";

import AppLayout from "./layouts/AppLayout";
import ActivationCompte from "./pages/ActivationCompte";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ReinitialisationMotDePasse from "./pages/ReinitialisationMotDePasse";
import {
  analyserUtilisateur,
  aPermission,
} from "./config/access";

import { PERMISSIONS } from "./config/permissions";

import "./styles/app.css";
import "./styles/components/shared.css";

import { API_URL } from "./config/api";
import api from "./config/apiClient";
import { authStorage } from "./services/authStorage";

/**
 * =========================================================
 * PREMIÈRE PAGE AUTORISÉE
 * =========================================================
 */

function obtenirPremierePageAutorisee(utilisateur) {
  if (!utilisateur) {
    return "/login";
  }

  const pages = [
    {
      path: "/dashboard",
      permission: PERMISSIONS.VOIR_DASHBOARD,
    },
    {
      path: "/employes",
      permission: PERMISSIONS.VOIR_EMPLOYES,
    },
    {
      path: "/historique",
      permission: PERMISSIONS.VOIR_HISTORIQUE,
    },
    {
      path: "/taches",
      permission: PERMISSIONS.VOIR_TACHES,
    },
    {
      path: "/demandes",
      permission: PERMISSIONS.VOIR_DEMANDES,
    },
    {
      path: "/rapports",
      permission: PERMISSIONS.VOIR_RAPPORTS,
    },
    {
      path: "/parametres",
      permission: PERMISSIONS.VOIR_PARAMETRES,
    },
  ];

  const pageAutorisee = pages.find(
    (page) =>
      aPermission(
        utilisateur,
        page.permission
      )
  );

  return pageAutorisee
    ? pageAutorisee.path
    : "/acces-refuse";
}

/**
 * =========================================================
 * APPLICATION
 * =========================================================
 */

function App() {
  const {
    languePourUtilisateur,
    setLangue,
    formatDatePourUtilisateur,
    setFormatDate,
  } = useLanguage();

  const [
    connecte,
    setConnecte,
  ] = useState(false);

  const [
    chargement,
    setChargement,
  ] = useState(true);

  const [
    utilisateur,
    setUtilisateur,
  ] = useState(null);

  useEffect(() => {
    const gererSessionExpiree = () => {
      setUtilisateur(null);
      setConnecte(false);
      setChargement(false);
    };

    window.addEventListener(
      "gain-office:session-expired",
      gererSessionExpiree
    );

    return () => {
      window.removeEventListener(
        "gain-office:session-expired",
        gererSessionExpiree
      );
    };
  }, []);

  /**
   * =======================================================
   * VÉRIFICATION DE SESSION
   * =======================================================
   */

  useEffect(() => {

    const verifierSession = async () => {

      const token = authStorage.getToken();

      if (!token) {

        setConnecte(false);
        setUtilisateur(null);
        setChargement(false);

        return;
      }

      try {

        const response = await api.get("/auth/me");

        const data = response.data || {};

        const utilisateurAPI =
          data.utilisateur ||
          data.user ||
          data.data;

        if (!utilisateurAPI) {
          throw new Error(
            "Utilisateur introuvable"
          );
        }

        /**
         * -------------------------------------------------
         * NORMALISATION DU RÔLE
         * -------------------------------------------------
         */

        const roleAPI =
          utilisateurAPI.role;

        const nomRole =
          typeof roleAPI === "object"
            ? (
                roleAPI?.nom ||
                roleAPI?.libelle ||
                ""
              )
            : (
                roleAPI ||
                utilisateurAPI.nom_role ||
                ""
              );

        /**
         * -------------------------------------------------
         * UTILISATEUR FINAL
         * -------------------------------------------------
         */

        const utilisateurNormalise = {
          ...utilisateurAPI,
          role: nomRole,
        };

        /**
         * -------------------------------------------------
         * ANALYSE DU CONTEXTE
         * -------------------------------------------------
         */

        const contexte =
          analyserUtilisateur(
            utilisateurNormalise
          );

        const utilisateurFinal = {
          ...utilisateurNormalise,

          contexte,

          permissions:
            contexte.permissions,

          service:
            contexte.service,

          poste:
            contexte.poste,
        };

        setLangue(
          languePourUtilisateur(utilisateurFinal.id_utilisateur || utilisateurFinal.id)
        );
        setFormatDate(
          formatDatePourUtilisateur(utilisateurFinal.id_utilisateur || utilisateurFinal.id),
          utilisateurFinal.id_utilisateur || utilisateurFinal.id
        );

        setUtilisateur(
          utilisateurFinal
        );

        setConnecte(true);

        /**
         * -------------------------------------------------
         * SAUVEGARDE LOCALE
         * -------------------------------------------------
         */

        authStorage.setUser(utilisateurFinal);

      } catch (error) {

        console.error(
          "Session GAIN OFFICE invalide :",
          error
        );

        /**
         * -----------------------------------------------
         * NETTOYAGE SESSION
         * -----------------------------------------------
         */

        authStorage.clear();

        setUtilisateur(null);
        setConnecte(false);

      } finally {

        setChargement(false);

      }
    };

    verifierSession();

  }, []);

  /**
   * =======================================================
   * CONNEXION
   * =======================================================
   */

  const gererConnexion =
    (utilisateurConnecte) => {

      if (!utilisateurConnecte) {
        return;
      }

      /**
       * -------------------------------------------------
       * NORMALISATION DU RÔLE
       * -------------------------------------------------
       */

      const roleAPI =
        utilisateurConnecte.role;

      const nomRole =
        typeof roleAPI === "object"
          ? (
              roleAPI?.nom ||
              roleAPI?.libelle ||
              ""
            )
          : (
              roleAPI ||
              utilisateurConnecte.nom_role ||
              ""
            );

      const utilisateurNormalise = {
        ...utilisateurConnecte,
        role: nomRole,
      };

      /**
       * -------------------------------------------------
       * ANALYSE COMPLÈTE
       * -------------------------------------------------
       */

      const contexte =
        analyserUtilisateur(
          utilisateurNormalise
        );

      const utilisateurFinal = {
        ...utilisateurNormalise,

        contexte,

        permissions:
          contexte.permissions,

        service:
          contexte.service,

        poste:
          contexte.poste,
      };

      setLangue(
        languePourUtilisateur(utilisateurFinal.id_utilisateur || utilisateurFinal.id)
      );
      setFormatDate(
        formatDatePourUtilisateur(utilisateurFinal.id_utilisateur || utilisateurFinal.id),
        utilisateurFinal.id_utilisateur || utilisateurFinal.id
      );

      setUtilisateur(
        utilisateurFinal
      );

      setConnecte(true);

      authStorage.setUser(utilisateurFinal);
    };

  /**
   * =======================================================
   * DÉCONNEXION
   * =======================================================
   */

  const gererDeconnexion =
    async () => {

      const token = authStorage.getToken();

      try {

        if (token) {
          await api.post("/auth/logout");
        }

      } catch (error) {

        console.error(
          "Erreur déconnexion API :",
          error
        );

      } finally {

        authStorage.clear();

        setUtilisateur(null);
        setConnecte(false);
      }
    };

  /**
   * =======================================================
   * CHARGEMENT
   * =======================================================
   */

  if (chargement) {

    return (
      <div className="app-loading">

        <div className="app-loading-box">

          <div className="app-loading-spinner" />

          <strong>
            GAIN OFFICE
          </strong>

          <span>
            Chargement de votre espace...
          </span>

        </div>

      </div>
    );
  }

  /**
   * =======================================================
   * APPLICATION
   * =======================================================
   */

  return (
    <AuthProvider>

      <BrowserRouter>

        {!connecte ? (

          /**
           * =================================================
           * NON CONNECTÉ
           * =================================================
           */

          <Routes>

            <Route
              path="/login"
              element={
                <Login
                  onConnexion={
                    gererConnexion
                  }
                />
              }
            />
            <Route
  path="/activation-compte"
  element={<ActivationCompte />}
/>

            <Route
  path="/mot-de-passe-oublie"
  element={<MotDePasseOublie />}
/>

            <Route
  path="/reinitialisation-mot-de-passe"
  element={<ReinitialisationMotDePasse />}
/>

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

          </Routes>

        ) : (

          /**
           * =================================================
           * CONNECTÉ
           * =================================================
           */

          <AppLayout
            utilisateur={utilisateur}
            onDeconnexion={gererDeconnexion}
          >

                <Routes>

                  {/* =========================================
                      RACINE
                  ========================================= */}

                  <Route
                    path="/"
                    element={
                      <Navigate
                        to={
                          obtenirPremierePageAutorisee(
                            utilisateur
                          )
                        }
                        replace
                      />
                    }
                  />

                  {/* =========================================
                      DASHBOARD
                  ========================================= */}

                  <Route
                    path="/dashboard"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_DASHBOARD
                        }
                      >
                        <Dashboard
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  {/* =========================================
                      EMPLOYÉS
                  ========================================= */}

                  <Route
                    path="/employes"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_EMPLOYES
                        }
                      >
                        <Employes
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  <Route
                    path="/historique"
                    element={
                      <RoutePermission
                        utilisateur={utilisateur}
                        permission={PERMISSIONS.VOIR_HISTORIQUE}
                      >
                        <HistoriqueActions />
                      </RoutePermission>
                    }
                  />

                  {/* L'ancienne URL reste un raccourci vers l'unique page. */}
                  <Route
                    path="/suivi-demandes"
                    element={<Navigate to="/demandes" replace />}
                  />

                  {/* =========================================
                      TÂCHES
                  ========================================= */}

                  <Route
                    path="/taches"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_TACHES
                        }
                      >
                        <Taches
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  {/* =========================================
                      DEMANDES
                  ========================================= */}

                  <Route
                    path="/demandes"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={[
                          PERMISSIONS.VOIR_DEMANDES,
                          PERMISSIONS.VOIR_SUIVI_DEMANDES,
                        ]}
                      >
                        <Demandes
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  {/* =========================================
                      RAPPORTS
                  ========================================= */}

                  <Route
                    path="/rapports"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_RAPPORTS
                        }
                      >
                        <Rapports
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  {/* =========================================
                      ANCIENNE ROUTE RAPPORTS-TÂCHES
                  ========================================= */}

                  <Route
                    path="/rapports-taches"
                    element={
                      <Navigate
                        to="/rapports"
                        replace
                      />
                    }
                  />

                  {/* =========================================
                      PARAMÈTRES
                  ========================================= */}

                  <Route
                    path="/parametres"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_PARAMETRES
                        }
                      >
                        <Parametres
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
                  />

                  {/* =========================================
                      PAGE ACCÈS REFUSÉ
                  ========================================= */}

                  <Route
                    path="/acces-refuse"
                    element={
                      <AccessDenied />
                    }
                  />

                  {/* =========================================
                      LOGIN SI DÉJÀ CONNECTÉ
                  ========================================= */}

                  <Route
                    path="/login"
                    element={
                      <Navigate
                        to={
                          obtenirPremierePageAutorisee(
                            utilisateur
                          )
                        }
                        replace
                      />
                    }
                  />

                  {/* =========================================
                      ROUTE INCONNUE
                  ========================================= */}

                  <Route
                    path="*"
                    element={<Page404 />}
                  />

                </Routes>

          </AppLayout>

        )}

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;
