import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Search,
  FileText,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { PERMISSIONS } from "../config/permissions";
import { aPermission } from "../config/access";

import "./Header.css";

import { API_URL } from "../config/api";

function Header({
  utilisateur,
  onDeconnexion,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOuvert, setMenuOuvert] =
    useState(false);

  const [
    notificationsOuvertes,
    setNotificationsOuvertes,
  ] = useState(false);

  const [
    notificationsNonLues,
    setNotificationsNonLues,
  ] = useState(0);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [recherche, setRecherche] =
    useState("");

  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  const token =
    localStorage.getItem("gain_office_token") ||
    localStorage.getItem("token");

  const nomComplet = utilisateur
    ? `${utilisateur.prenom || ""} ${
        utilisateur.nom || ""
      }`.trim()
    : "Utilisateur";

  const role =
    utilisateur?.role?.nom ||
    utilisateur?.role ||
    "Employé";

  const initiales = (
    `${utilisateur?.prenom || ""} ${
      utilisateur?.nom || ""
    }`
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0])
      .join("") || "GO"
  ).toUpperCase();

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const peutVoirNotifications = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_NOTIFICATIONS
  );

  const peutVoirRapports = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_RAPPORTS
  );

  const peutVoirParametres = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_PARAMETRES
  );

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const lireNotifications = async () => {
    if (!token || !peutVoirNotifications) {
      setNotifications([]);
      setNotificationsNonLues(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      const liste =
        data.notifications ||
        data.data ||
        data.resultats ||
        [];

      const tableau = Array.isArray(liste)
        ? liste
        : [];

      setNotifications(tableau);

      const nonLues = tableau.filter(
        (notification) => {
          if (
            notification.lu === true ||
            notification.lu === 1 ||
            notification.est_lue === true ||
            notification.est_lue === 1
          ) {
            return false;
          }

          const statut = String(
            notification.statut ||
              notification.status ||
              ""
          ).toLowerCase();

          if (
            statut === "lu" ||
            statut === "lue" ||
            statut === "read" ||
            statut === "traitee" ||
            statut === "traitée"
          ) {
            return false;
          }

          return true;
        }
      );

      setNotificationsNonLues(
        nonLues.length
      );
    } catch (error) {
      console.error(
        "Erreur récupération notifications :",
        error
      );
    }
  };

  useEffect(() => {
    lireNotifications();

    const interval = setInterval(() => {
      lireNotifications();
    }, 30000);

    return () =>
      clearInterval(interval);
  }, [
    token,
    location.pathname,
    peutVoirNotifications,
  ]);

  useEffect(() => {
    const actualiser = () => {
      lireNotifications();
    };

    window.addEventListener(
      "gain-office-notifications-updated",
      actualiser
    );

    return () => {
      window.removeEventListener(
        "gain-office-notifications-updated",
        actualiser
      );
    };
  }, [
    token,
    peutVoirNotifications,
  ]);
    // =====================================================
  // FERMETURE DES MENUS
  // =====================================================

  useEffect(() => {
    const fermerMenus = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOuvert(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOuvertes(false);
      }
    };

    document.addEventListener(
      "mousedown",
      fermerMenus
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        fermerMenus
      );
    };
  }, []);

  // =====================================================
  // RECHERCHE
  // =====================================================

  const effectuerRecherche = (event) => {
    if (event.key !== "Enter") return;

    const valeur = recherche.trim();

    if (!valeur) return;

    const valeurMinuscule =
      valeur.toLowerCase();

    if (
      valeurMinuscule.includes("rapport") ||
      valeurMinuscule.includes("report")
    ) {
      if (peutVoirRapports) {
        navigate("/rapports");
      }
    } else if (
      valeurMinuscule.includes("employ") ||
      valeurMinuscule.includes("personnel")
    ) {
      if (
        aPermission(
          utilisateur,
          PERMISSIONS.VOIR_EMPLOYES
        )
      ) {
        navigate("/employes");
      }
    } else if (
      valeurMinuscule.includes("tache") ||
      valeurMinuscule.includes("tâche")
    ) {
      if (
        aPermission(
          utilisateur,
          PERMISSIONS.VOIR_TACHES
        )
      ) {
        navigate("/taches");
      }
    } else if (
      valeurMinuscule.includes("demande")
    ) {
      if (
        aPermission(
          utilisateur,
          PERMISSIONS.VOIR_DEMANDES
        )
      ) {
        navigate("/demandes");
      }
    } else if (
      valeurMinuscule.includes(
        "notification"
      )
    ) {
      if (peutVoirNotifications) {
        navigate("/notifications");
      }
    } else if (
      valeurMinuscule.includes("param")
    ) {
      if (peutVoirParametres) {
        navigate("/parametres");
      }
    }
  };

  // =====================================================
  // OUVERTURE DES MENUS
  // =====================================================

  const ouvrirNotifications = () => {
    if (!peutVoirNotifications) return;

    setNotificationsOuvertes(
      (ancienne) => !ancienne
    );

    setMenuOuvert(false);
  };

  const ouvrirProfil = () => {
    setMenuOuvert(
      (ancienne) => !ancienne
    );

    setNotificationsOuvertes(false);
  };

  const allerNotifications = () => {
    if (!peutVoirNotifications) return;

    setNotificationsOuvertes(false);
    navigate("/notifications");
  };

  const allerRapports = () => {
    if (!peutVoirRapports) return;

    setMenuOuvert(false);
    navigate("/rapports");
  };

  const allerParametres = () => {
    if (!peutVoirParametres) return;

    setMenuOuvert(false);
    navigate("/parametres");
  };

  const allerProfil = () => {
    if (!peutVoirParametres) return;

    setMenuOuvert(false);
    navigate("/parametres");
  };

  // =====================================================
  // DÉCONNEXION
  // =====================================================

  const deconnexion = async () => {
    setMenuOuvert(false);

    if (onDeconnexion) {
      await onDeconnexion();
    }
  };

  // =====================================================
  // NOTIFICATION HELPERS
  // =====================================================

  const obtenirTitreNotification = (
    notification
  ) => {
    return (
      notification.titre ||
      notification.objet ||
      notification.type ||
      "Notification"
    );
  };

  const obtenirMessageNotification = (
    notification
  ) => {
    return (
      notification.message ||
      notification.description ||
      notification.contenu ||
      "Nouvelle notification"
    );
  };

  return (
    <header className="app-header">

      <div className="header-left">

        <div className="header-title">
          <h1>GAIN OFFICE</h1>
          <span>
            Gestion administrative
          </span>
        </div>

      </div>

      <div className="header-right">

        {/* =================================================
            RECHERCHE
        ================================================= */}

        <div className="header-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(event) =>
              setRecherche(
                event.target.value
              )
            }
            onKeyDown={effectuerRecherche}
          />

        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        {peutVoirNotifications && (
          <div
            className="header-notification"
            ref={notificationsRef}
          >

            <button
              type="button"
              className="header-icon-button"
              onClick={
                ouvrirNotifications
              }
              aria-label="Notifications"
            >

              <Bell size={21} />

              {notificationsNonLues > 0 && (
                <span className="notification-badge">
                  {notificationsNonLues > 99
                    ? "99+"
                    : notificationsNonLues}
                </span>
              )}

            </button>

            {notificationsOuvertes && (
              <div className="notifications-dropdown">

                <div className="notifications-dropdown-header">

                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <span>
                      {notificationsNonLues} non lue
                      {notificationsNonLues >
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="notifications-close-button"
                    aria-label="Fermer les notifications"
                    onClick={() =>
                      setNotificationsOuvertes(false)
                    }
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="notifications-list">

                  {notifications.length ===
                  0 ? (
                    <div className="notifications-empty">

                      <Bell size={28} />

                      <p>
                        Aucune notification
                      </p>

                    </div>
                  ) : (
                    notifications
                      .slice(0, 5)
                      .map(
                        (
                          notification,
                          index
                        ) => (
                          <button
                            type="button"
                            className="notification-item"
                            key={
                              notification.id_notification ||
                              notification.id ||
                              index
                            }
                            onClick={
                              allerNotifications
                            }
                          >

                            <div className="notification-item-icon">
                              <Bell size={16} />
                            </div>

                            <div className="notification-item-content">

                              <strong>
                                {obtenirTitreNotification(
                                  notification
                                )}
                              </strong>

                              <p>
                                {obtenirMessageNotification(
                                  notification
                                )}
                              </p>

                            </div>

                          </button>
                        )
                      )
                  )}

                </div>

                <button
                  type="button"
                  className="notifications-footer-button"
                  onClick={
                    allerNotifications
                  }
                >
                  Voir toutes les notifications
                </button>

              </div>
            )}

          </div>
        )}
                {/* =================================================
            PROFIL UTILISATEUR
        ================================================= */}

        <div
          className="header-profile"
          ref={menuRef}
        >

          <button
            type="button"
            className="profile-button"
            onClick={ouvrirProfil}
          >

            <div className="profile-avatar">
              {initiales}
            </div>

            <div className="profile-information">

              <strong>
                {nomComplet}
              </strong>

              <span>{role}</span>

            </div>

            <ChevronDown
              size={17}
              className={
                menuOuvert
                  ? "profile-chevron rotated"
                  : "profile-chevron"
              }
            />

          </button>

          {menuOuvert && (
            <div className="profile-dropdown">

              <div className="profile-dropdown-top">

                <div className="profile-dropdown-avatar">
                  {initiales}
                </div>

                <div>

                  <strong>
                    {nomComplet}
                  </strong>

                  <span>{role}</span>

                </div>

              </div>

              <div className="profile-dropdown-separator" />

              {/* MON PROFIL */}

              {peutVoirParametres && (
                <button
                  type="button"
                  onClick={allerProfil}
                >
                  <User size={17} />
                  Mon profil
                </button>
              )}

              {/* RAPPORTS */}

              {peutVoirRapports && (
                <button
                  type="button"
                  onClick={allerRapports}
                >
                  <FileText size={17} />
                  Rapports
                </button>
              )}

              {/* PARAMÈTRES */}

              {peutVoirParametres && (
                <button
                  type="button"
                  onClick={
                    allerParametres
                  }
                >
                  <Settings size={17} />
                  Paramètres
                </button>
              )}

              <div className="profile-dropdown-separator" />

              {/* DÉCONNEXION */}

              <button
                type="button"
                className="logout-button"
                onClick={deconnexion}
              >
                <LogOut size={17} />
                Déconnexion
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Header;