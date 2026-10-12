// src/config/permissions.js

/**
 * =========================================================
 * GAIN OFFICE — PERMISSIONS
 * =========================================================
 *
 * Une permission représente une action précise.
 *
 * Architecture :
 *
 * UTILISATEUR
 *     ↓
 * RÔLE
 *     ↓
 * PERMISSIONS
 *     ↓
 * MENU / ACTIONS
 *
 * Le backend Laravel devra appliquer les mêmes règles.
 */

export const PERMISSIONS = {

  // =======================================================
  // DASHBOARD
  // =======================================================

  VOIR_DASHBOARD: "voir_dashboard",


  // =======================================================
  // EMPLOYÉS
  // =======================================================

  VOIR_EMPLOYES: "voir_employes",
  CREER_EMPLOYE: "creer_employe",
  MODIFIER_EMPLOYE: "modifier_employe",
  SUPPRIMER_EMPLOYE: "supprimer_employe",


  // =======================================================
  // TÂCHES
  // =======================================================

  VOIR_TACHES: "voir_taches",
  CREER_TACHE: "creer_tache",
  MODIFIER_TACHE: "modifier_tache",
  SUPPRIMER_TACHE: "supprimer_tache",
  ASSIGNER_TACHE: "assigner_tache",
  SUIVRE_TACHE: "suivre_tache",
  TERMINER_TACHE: "terminer_tache",
  VALIDER_TACHE: "valider_tache",


  // =======================================================
  // DEMANDES
  // =======================================================

  VOIR_DEMANDES: "voir_demandes",
  CREER_DEMANDE: "creer_demande",
  MODIFIER_DEMANDE: "modifier_demande",
  SUPPRIMER_DEMANDE: "supprimer_demande",

  TRAITER_DEMANDE: "traiter_demande",
  ACCEPTER_DEMANDE: "accepter_demande",
  REFUSER_DEMANDE: "refuser_demande",


  // =======================================================
  // RAPPORTS
  // =======================================================

  VOIR_RAPPORTS: "voir_rapports",
  CREER_RAPPORT: "creer_rapport",
  MODIFIER_RAPPORT: "modifier_rapport",
  SUPPRIMER_RAPPORT: "supprimer_rapport",

  VALIDER_RAPPORT: "valider_rapport",
  CONTROLER_RAPPORT: "controler_rapport",


  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  VOIR_NOTIFICATIONS: "voir_notifications",
  MARQUER_NOTIFICATION_LUE: "marquer_notification_lue",
  SUPPRIMER_NOTIFICATION: "supprimer_notification",


  // =======================================================
  // PARAMÈTRES
  // =======================================================

  VOIR_PARAMETRES: "voir_parametres",
  MODIFIER_PARAMETRES: "modifier_parametres",


  // =======================================================
  // ADMINISTRATION
  // =======================================================

  GERER_ROLES: "gerer_roles",
  GERER_SERVICES: "gerer_services",
  GERER_POSTES: "gerer_postes",
};


export default PERMISSIONS;