import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  X,
  Trash2,
  Check,
  ClipboardCheck,
  FileText,
  UserPlus,
  AlertCircle,
  MessageSquare,
  Settings2,
  Clock3,
} from "lucide-react";

import "../styles/pages/notifications.css";

import { PERMISSIONS } from "../config/permissions";
import { aPermission, getRole } from "../config/access";
import { ROLES } from "../config/roles";
import { API_URL } from "../config/api";


function obtenirIcone(type) {
  switch (type) {
    case "tache":
      return <ClipboardCheck size={20} />;

    case "demande":
      return <FileText size={20} />;

    case "message":
      return <MessageSquare size={20} />;

    case "validation":
      return <CheckCheck size={20} />;

    case "employe":
      return <UserPlus size={20} />;

    case "rappel":
      return <Clock3 size={20} />;

    case "correction":
      return <AlertCircle size={20} />;

    case "systeme":
      return <Settings2 size={20} />;

    default:
      return <Bell size={20} />;
  }
}


function obtenirClasseIcone(type) {
  switch (type) {
    case "tache":
      return "notification-icon blue";

    case "demande":
      return "notification-icon purple";

    case "message":
      return "notification-icon cyan";

    case "validation":
      return "notification-icon green";

    case "employe":
      return "notification-icon orange";

    case "rappel":
      return "notification-icon yellow";

    case "correction":
      return "notification-icon red";

    case "systeme":
      return "notification-icon gray";

    default:
      return "notification-icon gray";
  }
}


function obtenirLibelleType(type) {
  switch (type) {
    case "tache":
      return "Tâche";

    case "demande":
      return "Demande";

    case "message":
      return "Message";

    case "validation":
      return "Validation";

    case "employe":
      return "Employé";

    case "rappel":
      return "Rappel";

    case "correction":
      return "Correction";

    case "systeme":
      return "Système";

    default:
      return "Notification";
  }
}


export default function Notifications({ utilisateur }) {

  const role = getRole(utilisateur) || ROLES.EMPLOYE;


  /*
   * =====================================================
   * PERMISSIONS
   * =====================================================
   */

  const peutVoirNotifications = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_NOTIFICATIONS
  );

  const peutMarquerNotificationLue = aPermission(
    utilisateur,
    PERMISSIONS.MARQUER_NOTIFICATION_LUE
  );

  const peutSupprimerNotification = aPermission(
    utilisateur,
    PERMISSIONS.SUPPRIMER_NOTIFICATION
  );


  /*
   * =====================================================
   * ETAT
   * =====================================================
   */

  const [notifications, setNotifications] = useState([]);

  const [recherche, setRecherche] = useState("");

  const [filtre, setFiltre] = useState("Toutes");

  const [selection, setSelection] = useState(null);

  const [menuOuvert, setMenuOuvert] = useState(null);

  /*
   * =====================================================
   * API NOTIFICATIONS
   * =====================================================
   * Les notifications sont chargées depuis Laravel et
   * synchronisées avec le Header (événement partagé).
   * Les champs sont mappés sur le modèle de la page
   * (id <- id_notification, date <- created_at).
   */

  const tokenNotif =
    localStorage.getItem("gain_office_token") ||
    localStorage.getItem("token") ||
    "";

  const notifierHeader = () => {
    window.dispatchEvent(
      new Event("gain-office-notifications-updated")
    );
  };

  const apiNotifications = async (
    endpoint = "",
    options = {}
  ) => {
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    if (tokenNotif) {
      headers.Authorization = `Bearer ${tokenNotif}`;
    }

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${API_URL}/notifications${endpoint}`,
      { ...options, headers }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Erreur de communication avec le serveur."
      );
    }

    return data;
  };

  const formaterNotification = (n) => ({
    ...n,
    id: n.id_notification ?? n.id,
    date: n.date_lecture || n.created_at || "",
    important:
      n.important ??
      ["correction", "rappel"].includes(n.type),
    auteur: n.auteur || n.type || "GAIN OFFICE",
  });

  const chargerNotifications = async () => {
    try {
      const data = await apiNotifications();

      const liste =
        data.notifications || data.data || [];

      setNotifications(
        (Array.isArray(liste) ? liste : []).map(
          formaterNotification
        )
      );
    } catch (error) {
      console.error(
        "Erreur chargement notifications :",
        error
      );
    }
  };

  useEffect(() => {
    if (!tokenNotif) {
      return undefined;
    }

    /*
     * Chargement dans un callback différé : évite un
     * setState synchrone directement dans l'effet.
     */
    const minuteur = setTimeout(() => {
      chargerNotifications();
    }, 0);

    return () => clearTimeout(minuteur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /*
   * =====================================================
   * FILTRES
   * =====================================================
   */

  const notificationsFiltrees = useMemo(() => {

    return notifications.filter((notification) => {

      const texte = `
        ${notification.titre}
        ${notification.message}
        ${notification.auteur}
        ${obtenirLibelleType(notification.type)}
      `.toLowerCase();

      const correspondRecherche =
        texte.includes(
          recherche.toLowerCase()
        );

      let correspondFiltre = true;

      if (filtre === "Non lues") {
        correspondFiltre = !notification.lu;
      }

      if (filtre === "Lues") {
        correspondFiltre = notification.lu;
      }

      if (filtre === "Importantes") {
        correspondFiltre = notification.important;
      }

      return (
        correspondRecherche &&
        correspondFiltre
      );
    });

  }, [
    notifications,
    recherche,
    filtre,
  ]);


  const nonLues = notifications.filter(
    (notification) => !notification.lu
  ).length;


  const importantes = notifications.filter(
    (notification) => notification.important
  ).length;
    /*
   * =====================================================
   * MARQUER COMME LUE
   * =====================================================
   */

  const marquerCommeLue = async (id) => {

    if (!peutMarquerNotificationLue) {
      return;
    }

    setNotifications((ancienneListe) =>
      ancienneListe.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              lu: true,
            }
          : notification
      )
    );

    setMenuOuvert(null);

    setSelection((ancienne) =>
      ancienne?.id === id
        ? {
            ...ancienne,
            lu: true,
          }
        : ancienne
    );

    try {
      await apiNotifications(`/${id}`, {
        method: "PUT",
      });

      notifierHeader();
    } catch (error) {
      console.error(
        "Erreur marquage lecture :",
        error
      );

      chargerNotifications();
    }
  };


  /*
   * =====================================================
   * MARQUER COMME NON LUE
   * =====================================================
   */

  const marquerCommeNonLue = (id) => {

    if (!peutMarquerNotificationLue) {
      return;
    }

    setNotifications((ancienneListe) =>
      ancienneListe.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              lu: false,
            }
          : notification
      )
    );

    setMenuOuvert(null);

    setSelection((ancienne) =>
      ancienne?.id === id
        ? {
            ...ancienne,
            lu: false,
          }
        : ancienne
    );
  };


  /*
   * =====================================================
   * TOUT MARQUER COMME LU
   * =====================================================
   */

  const marquerToutCommeLu = async () => {

    if (!peutMarquerNotificationLue) {
      return;
    }

    setNotifications((ancienneListe) =>
      ancienneListe.map((notification) => ({
        ...notification,
        lu: true,
      }))
    );

    setSelection(null);
    setMenuOuvert(null);

    try {
      await apiNotifications("/read-all", {
        method: "POST",
      });

      notifierHeader();
    } catch (error) {
      console.error(
        "Erreur marquage global :",
        error
      );

      chargerNotifications();
    }
  };


  /*
   * =====================================================
   * SUPPRIMER UNE NOTIFICATION
   * =====================================================
   */

  const supprimerNotification = async (id) => {

    if (!peutSupprimerNotification) {
      return;
    }

    setNotifications((ancienneListe) =>
      ancienneListe.filter(
        (notification) =>
          notification.id !== id
      )
    );

    setSelection((ancienne) =>
      ancienne?.id === id
        ? null
        : ancienne
    );

    setMenuOuvert(null);

    try {
      await apiNotifications(`/${id}`, {
        method: "DELETE",
      });

      notifierHeader();
    } catch (error) {
      console.error(
        "Erreur suppression :",
        error
      );

      chargerNotifications();
    }
  };


  /*
   * =====================================================
   * SUPPRIMER LES NOTIFICATIONS LUES
   * =====================================================
   */

  const supprimerLues = async () => {

    if (!peutSupprimerNotification) {
      return;
    }

    const lues = notifications.filter(
      (notification) => notification.lu
    );

    setNotifications((ancienneListe) =>
      ancienneListe.filter(
        (notification) =>
          !notification.lu
      )
    );

    setSelection(null);
    setMenuOuvert(null);

    try {
      /*
       * Suppression une par une : l'API ne propose
       * pas de suppression en lot.
       */
      for (const notification of lues) {
        await apiNotifications(
          `/${notification.id}`,
          { method: "DELETE" }
        );
      }

      notifierHeader();
    } catch (error) {
      console.error(
        "Erreur suppression des lues :",
        error
      );

      chargerNotifications();
    }
  };


  /*
   * =====================================================
   * OUVRIR UNE NOTIFICATION
   * =====================================================
   */

  const ouvrirNotification = (
    notification
  ) => {

    setMenuOuvert(null);

    setSelection(notification);

    if (
      !notification.lu &&
      peutMarquerNotificationLue
    ) {

      setNotifications((ancienneListe) =>
        ancienneListe.map((element) =>
          element.id === notification.id
            ? {
                ...element,
                lu: true,
              }
            : element
        )
      );

      setSelection((ancienne) =>
        ancienne?.id === notification.id
          ? {
              ...ancienne,
              lu: true,
            }
          : ancienne
      );

      apiNotifications(
        `/${notification.id}`,
        { method: "PUT" }
      )
        .then(notifierHeader)
        .catch((error) => {
          console.error(
            "Erreur marquage lecture :",
            error
          );
        });
    }
  };


  /*
   * =====================================================
   * FERMER DETAILS
   * =====================================================
   */

  const fermerDetails = () => {
    setSelection(null);
    setMenuOuvert(null);
  };


  /*
   * =====================================================
   * MENU D'ACTIONS
   * =====================================================
   */

  const ouvrirMenu = (
    event,
    id
  ) => {

    event.preventDefault();
    event.stopPropagation();

    setMenuOuvert((ancien) =>
      ancien === id
        ? null
        : id
    );
  };


  /*
   * =====================================================
   * SECURITE D'AFFICHAGE
   * =====================================================
   */

  if (!peutVoirNotifications) {

    return (
      <div className="notifications-page">

        <div className="notifications-header">

          <div>

            <div className="notifications-breadcrumb">
              GAIN OFFICE
              <span>/</span>
              Notifications
            </div>

            <h1>
              Notifications
            </h1>

            <p>
              Centre de notifications
              de GAIN OFFICE.
            </p>

          </div>

        </div>

        <div className="notifications-empty">

          <AlertCircle size={42} />

          <h3>
            Accès non autorisé
          </h3>

          <p>
            Vous n'avez pas l'autorisation
            de consulter les notifications.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="notifications-page">
      {/* HEADER */}

      <div className="notifications-header">

        <div>

          <div className="notifications-breadcrumb">
            GAIN OFFICE
            <span>/</span>
            Notifications
          </div>

          <h1>
            Notifications
          </h1>

          <p>
            Retrouvez toutes les informations
            importantes concernant votre activité.
          </p>

        </div>

        {nonLues > 0 &&
          peutMarquerNotificationLue && (

          <button
            type="button"
            className="notifications-read-all"
            onClick={marquerToutCommeLu}
          >
            <CheckCheck size={18} />
            Tout marquer comme lu
          </button>

        )}

      </div>


      {/* ROLE */}

      <div className="notifications-role-banner">

        <div className="notifications-role-icon">
          <Bell size={20} />
        </div>

        <div>

          <strong>
            Centre de notifications
          </strong>

          <p>
            Connecté en tant que{" "}
            {utilisateur?.nom ||
              utilisateur?.prenom ||
              role}.
            Les notifications sont adaptées
            à votre rôle de {role}.
          </p>

        </div>

      </div>


      {/* STATISTIQUES */}

      <div className="notifications-stats">

        <div className="notification-stat-card">

          <div className="notification-stat-icon blue">
            <Bell size={19} />
          </div>

          <div>

            <span>
              Total
            </span>

            <strong>
              {notifications.length}
            </strong>

          </div>

        </div>


        <div className="notification-stat-card">

          <div className="notification-stat-icon red">
            <AlertCircle size={19} />
          </div>

          <div>

            <span>
              Non lues
            </span>

            <strong>
              {nonLues}
            </strong>

          </div>

        </div>


        <div className="notification-stat-card">

          <div className="notification-stat-icon green">
            <CheckCheck size={19} />
          </div>

          <div>

            <span>
              Lues
            </span>

            <strong>
              {notifications.length -
                nonLues}
            </strong>

          </div>

        </div>


        <div className="notification-stat-card">

          <div className="notification-stat-icon orange">
            <AlertCircle size={19} />
          </div>

          <div>

            <span>
              Importantes
            </span>

            <strong>
              {importantes}
            </strong>

          </div>

        </div>

      </div>


      {/* BARRE OUTILS */}

      <div className="notifications-toolbar">

        <div className="notifications-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Rechercher une notification..."
            value={recherche}
            onChange={(event) =>
              setRecherche(
                event.target.value
              )
            }
          />

        </div>


        <div className="notifications-filter">

          <Filter size={17} />

          <select
            value={filtre}
            onChange={(event) =>
              setFiltre(
                event.target.value
              )
            }
          >

            <option value="Toutes">
              Toutes
            </option>

            <option value="Non lues">
              Non lues
            </option>

            <option value="Lues">
              Lues
            </option>

            <option value="Importantes">
              Importantes
            </option>

          </select>

        </div>


        {peutSupprimerNotification && (

          <button
            type="button"
            className="notifications-delete-read"
            onClick={supprimerLues}
          >
            <Trash2 size={17} />
            Supprimer les lues
          </button>

        )}

      </div>


      {/* LISTE */}

      <div className="notifications-panel">

        <div className="notifications-panel-header">

          <div>

            <h2>
              Activité récente
            </h2>

            <span>
              {notificationsFiltrees.length}{" "}
              notification(s)
            </span>

          </div>

          <div className="notifications-live">
            <span />
            Actualisé
          </div>

        </div>


        <div className="notifications-list">

          {notificationsFiltrees.length === 0 ? (

            <div className="notifications-empty">

              <Bell size={42} />

              <h3>
                Aucune notification
              </h3>

              <p>
                Aucune notification ne correspond
                à vos critères.
              </p>

              {(recherche ||
                filtre !== "Toutes") && (

                <button
                  type="button"
                  onClick={() => {
                    setRecherche("");
                    setFiltre("Toutes");
                  }}
                >
                  Réinitialiser les filtres
                </button>

              )}

            </div>

          ) : (

            notificationsFiltrees.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={`notification-row ${
                    !notification.lu
                      ? "unread"
                      : ""
                  }`}
                  onClick={() =>
                    ouvrirNotification(
                      notification
                    )
                  }
                >

                  <div
                    className={obtenirClasseIcone(
                      notification.type
                    )}
                  >
                    {obtenirIcone(
                      notification.type
                    )}
                  </div>


                  <div className="notification-content">

                    <div className="notification-top-line">

                      <div className="notification-title-wrapper">

                        {!notification.lu && (
                          <span className="notification-unread-dot" />
                        )}

                        <h3>
                          {notification.titre}
                        </h3>

                        {notification.important && (
                          <span className="notification-important">
                            Important
                          </span>
                        )}

                      </div>

                      <span className="notification-date">
                        {notification.date}
                      </span>

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <div className="notification-bottom">

                      <span className="notification-type">
                        {obtenirLibelleType(
                          notification.type
                        )}
                      </span>

                      <span>
                        De :{" "}
                        {notification.auteur}
                      </span>

                    </div>

                  </div>


                  {/* MENU */}

                  <div className="notification-actions">

                    <button
                      type="button"
                      className="notification-more"
                      aria-label="Options de la notification"
                      onClick={(event) =>
                        ouvrirMenu(
                          event,
                          notification.id
                        )
                      }
                    >
                      <span />
                      <span />
                      <span />
                    </button>


                    {menuOuvert ===
                      notification.id && (

                      <div
                        className="notification-menu"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >

                        {peutMarquerNotificationLue &&
                          (!notification.lu ? (

                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                marquerCommeLue(
                                  notification.id
                                );
                              }}
                            >
                              <Check size={16} />
                              Marquer comme lue
                            </button>

                          ) : (

                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                marquerCommeNonLue(
                                  notification.id
                                );
                              }}
                            >
                              <Bell size={16} />
                              Marquer comme non lue
                            </button>

                          ))}


                        {peutSupprimerNotification && (

                          <button
                            type="button"
                            className="danger"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              supprimerNotification(
                                notification.id
                              );
                            }}
                          >
                            <Trash2 size={16} />
                            Supprimer
                          </button>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>
            {/* MODALE DETAILS */}

      {selection && (

        <div
          className="notification-modal-overlay"
          onMouseDown={fermerDetails}
        >

          <div
            className="notification-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="notification-modal-header">

              <div className="notification-modal-title">

                <div
                  className={obtenirClasseIcone(
                    selection.type
                  )}
                >
                  {obtenirIcone(
                    selection.type
                  )}
                </div>

                <div>

                  <span>
                    {obtenirLibelleType(
                      selection.type
                    )}
                  </span>

                  <h2>
                    {selection.titre}
                  </h2>

                </div>

              </div>


              <button
                type="button"
                className="notification-modal-close"
                onClick={fermerDetails}
              >
                <X size={20} />
              </button>

            </div>


            <div className="notification-modal-body">

              {selection.important && (

                <div className="notification-detail-important">

                  <AlertCircle size={18} />

                  <span>
                    Cette notification est
                    marquée comme importante.
                  </span>

                </div>

              )}


              <div className="notification-detail-message">

                <p>
                  {selection.message}
                </p>

              </div>


              <div className="notification-detail-grid">

                <div>

                  <span>
                    Expéditeur
                  </span>

                  <strong>
                    {selection.auteur}
                  </strong>

                </div>


                <div>

                  <span>
                    Date
                  </span>

                  <strong>
                    {selection.date}
                  </strong>

                </div>


                <div>

                  <span>
                    Type
                  </span>

                  <strong>
                    {obtenirLibelleType(
                      selection.type
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    État
                  </span>

                  <strong>
                    {selection.lu
                      ? "Lue"
                      : "Non lue"}
                  </strong>

                </div>

              </div>

            </div>


            <div className="notification-modal-footer">

              {!selection.lu &&
                peutMarquerNotificationLue && (

                <button
                  type="button"
                  className="notification-modal-primary"
                  onClick={() =>
                    marquerCommeLue(
                      selection.id
                    )
                  }
                >
                  <CheckCheck size={17} />
                  Marquer comme lue
                </button>

              )}


              {peutSupprimerNotification && (

                <button
                  type="button"
                  className="notification-modal-secondary danger-button"
                  onClick={() =>
                    supprimerNotification(
                      selection.id
                    )
                  }
                >
                  <Trash2 size={17} />
                  Supprimer
                </button>

              )}


              <button
                type="button"
                className="notification-modal-secondary"
                onClick={fermerDetails}
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}