import {
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employes from "./pages/Employes";
import DataTable from "./pages/DataTable";
import Taches from "./pages/Taches";
import Demandes from "./pages/Demandes";
import Notifications from "./pages/Notifications";
import Parametres from "./pages/Parametres";
import Rapports from "./pages/Rapports";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ActivationCompte from "./pages/ActivationCompte";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ReinitialisationMotDePasse from "./pages/ReinitialisationMotDePasse";
import {
  analyserUtilisateur,
  aPermission,
} from "./config/access";

import { PERMISSIONS } from "./config/permissions";

import "./styles/app.css";

import { API_URL } from "./config/api";
import api from "./config/apiClient";

/**
 * =========================================================
 * PAGE — ACCÈS REFUSÉ
 * =========================================================
 */

function AccesRefuse() {
  const location = useLocation();

  return (
    <div className="access-denied-page">
      <div className="access-denied-box">

        <div className="access-denied-icon">
          🔒
        </div>

        <h1>
          Accès refusé
        </h1>

        <p>
          Vous n'avez pas les permissions
          nécessaires pour accéder à cette page.
        </p>

        <small>
          Page demandée :{" "}
          {location.pathname}
        </small>

      </div>
    </div>
  );
}

/**
 * =========================================================
 * ROUTE PROTÉGÉE PAR PERMISSION
 * =========================================================
 */

function RoutePermission({
  utilisateur,
  permission,
  children,
}) {
  if (!utilisateur) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    permission &&
    !aPermission(
      utilisateur,
      permission
    )
  ) {
    return <AccesRefuse />;
  }

  return children;
}

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
      path: "/notifications",
      permission: PERMISSIONS.VOIR_NOTIFICATIONS,
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

  /**
   * =======================================================
   * VÉRIFICATION DE SESSION
   * =======================================================
   */

  useEffect(() => {

    const verifierSession = async () => {

      const token =
        localStorage.getItem(
          "gain_office_token"
        ) ||
        localStorage.getItem(
          "token"
        );

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

        setUtilisateur(
          utilisateurFinal
        );

        setConnecte(true);

        /**
         * -------------------------------------------------
         * SAUVEGARDE LOCALE
         * -------------------------------------------------
         */

        localStorage.setItem(
          "gain_office_user",
          JSON.stringify(
            utilisateurFinal
          )
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            utilisateurFinal
          )
        );

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

        localStorage.removeItem(
          "gain_office_token"
        );

        localStorage.removeItem(
          "gain_office_user"
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

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

      setUtilisateur(
        utilisateurFinal
      );

      setConnecte(true);

      localStorage.setItem(
        "gain_office_user",
        JSON.stringify(
          utilisateurFinal
        )
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          utilisateurFinal
        )
      );
    };

  /**
   * =======================================================
   * DÉCONNEXION
   * =======================================================
   */

  const gererDeconnexion =
    async () => {

      const token =
        localStorage.getItem(
          "gain_office_token"
        ) ||
        localStorage.getItem(
          "token"
        );

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

        localStorage.removeItem(
          "gain_office_token"
        );

        localStorage.removeItem(
          "gain_office_user"
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

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

          <div className="app-layout">

            <Sidebar
              utilisateur={
                utilisateur
              }
              onDeconnexion={
                gererDeconnexion
              }
            />

            <div className="app-main">

              <Header
                utilisateur={
                  utilisateur
                }
                onDeconnexion={
                  gererDeconnexion
                }
              />

              <main className="app-content">

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

                  {/* =========================================
                      DATA TABLE
                  ========================================= */}

                  <Route
                    path="/data-table"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_EMPLOYES
                        }
                      >
                        <DataTable
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
                    }
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
                        permission={
                          PERMISSIONS.VOIR_DEMANDES
                        }
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
                      NOTIFICATIONS
                  ========================================= */}

                  <Route
                    path="/notifications"
                    element={
                      <RoutePermission
                        utilisateur={
                          utilisateur
                        }
                        permission={
                          PERMISSIONS.VOIR_NOTIFICATIONS
                        }
                      >
                        <Notifications
                          utilisateur={
                            utilisateur
                          }
                        />
                      </RoutePermission>
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
                      <AccesRefuse />
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

                </Routes>

              </main>

            </div>

          </div>

        )}

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;