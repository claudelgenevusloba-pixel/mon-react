// src/config/roles.js

import { PERMISSIONS } from "./permissions";

/**
 * =========================================================
 * GAIN OFFICE — RÔLES
 * =========================================================
 */

export const ROLES = {

  DIRECTEUR: "Directeur",

  SOUS_DIRECTEUR: "Sous-directeur",

  RH: "Ressources humaines",

  RESPONSABLE: "Responsable",

  EMPLOYE: "Employé",

  ADMINISTRATEUR: "Administrateur",
};


/**
 * =========================================================
 * PERMISSIONS PAR RÔLE
 * =========================================================
 */

export const ROLE_PERMISSIONS = {

  // =======================================================
  // DIRECTEUR
  // =======================================================

  [ROLES.DIRECTEUR]: [

    PERMISSIONS.VOIR_DASHBOARD,
    PERMISSIONS.VOIR_HISTORIQUE,

    // Employés
    PERMISSIONS.VOIR_EMPLOYES,

    // Tâches
    PERMISSIONS.VOIR_TACHES,
    PERMISSIONS.CREER_TACHE,
    PERMISSIONS.MODIFIER_TACHE,
    PERMISSIONS.SUPPRIMER_TACHE,
    PERMISSIONS.ASSIGNER_TACHE,
    PERMISSIONS.SUIVRE_TACHE,
    PERMISSIONS.TERMINER_TACHE,
    PERMISSIONS.VALIDER_TACHE,

    // Demandes
    PERMISSIONS.VOIR_DEMANDES,
    PERMISSIONS.CREER_DEMANDE,
    PERMISSIONS.MODIFIER_DEMANDE,
    PERMISSIONS.TRAITER_DEMANDE,
    PERMISSIONS.ACCEPTER_DEMANDE,
    PERMISSIONS.REFUSER_DEMANDE,

    // Rapports
    PERMISSIONS.VOIR_RAPPORTS,
    PERMISSIONS.VALIDER_RAPPORT,
    PERMISSIONS.CONTROLER_RAPPORT,

    // Notifications
    PERMISSIONS.VOIR_NOTIFICATIONS,
    PERMISSIONS.MARQUER_NOTIFICATION_LUE,

    // Paramètres
    PERMISSIONS.VOIR_PARAMETRES,
  ],


  // =======================================================
  // RH
  // =======================================================

  [ROLES.RH]: [

    PERMISSIONS.VOIR_DASHBOARD,

    // Employés
    PERMISSIONS.VOIR_EMPLOYES,
    PERMISSIONS.CREER_EMPLOYE,
    PERMISSIONS.MODIFIER_EMPLOYE,
    PERMISSIONS.SUPPRIMER_EMPLOYE,

    // Tâches
    PERMISSIONS.VOIR_TACHES,
    PERMISSIONS.SUIVRE_TACHE,

    // Demandes
    PERMISSIONS.VOIR_DEMANDES,
    PERMISSIONS.CREER_DEMANDE,
    PERMISSIONS.MODIFIER_DEMANDE,
    PERMISSIONS.TRAITER_DEMANDE,
    PERMISSIONS.ACCEPTER_DEMANDE,
    PERMISSIONS.REFUSER_DEMANDE,

    // Rapports
    PERMISSIONS.VOIR_RAPPORTS,
    PERMISSIONS.CREER_RAPPORT,
    PERMISSIONS.MODIFIER_RAPPORT,

    // Notifications
    PERMISSIONS.VOIR_NOTIFICATIONS,
    PERMISSIONS.MARQUER_NOTIFICATION_LUE,

    // Paramètres
    PERMISSIONS.VOIR_PARAMETRES,
  ],


  // =======================================================
  // RESPONSABLE
  // =======================================================

  [ROLES.RESPONSABLE]: [

    PERMISSIONS.VOIR_DASHBOARD,

    // Tâches
    PERMISSIONS.VOIR_TACHES,
    PERMISSIONS.CREER_TACHE,
    PERMISSIONS.MODIFIER_TACHE,
    PERMISSIONS.ASSIGNER_TACHE,
    PERMISSIONS.SUIVRE_TACHE,
    PERMISSIONS.TERMINER_TACHE,

    // Demandes
    PERMISSIONS.VOIR_DEMANDES,
    PERMISSIONS.CREER_DEMANDE,
    PERMISSIONS.MODIFIER_DEMANDE,
    PERMISSIONS.TRAITER_DEMANDE,
    PERMISSIONS.ACCEPTER_DEMANDE,
    PERMISSIONS.REFUSER_DEMANDE,

    // Rapports
    PERMISSIONS.VOIR_RAPPORTS,
    PERMISSIONS.CREER_RAPPORT,
    PERMISSIONS.MODIFIER_RAPPORT,

    PERMISSIONS.VALIDER_RAPPORT,


    // Notifications
    PERMISSIONS.VOIR_NOTIFICATIONS,
    PERMISSIONS.MARQUER_NOTIFICATION_LUE,

    // Paramètres
    PERMISSIONS.VOIR_PARAMETRES,
  ],

  // Le Sous-directeur dispose des permissions opérationnelles
  // d'un responsable, notamment pour créer des demandes.
  [ROLES.SOUS_DIRECTEUR]: [],


  // =======================================================
  // EMPLOYÉ
  // =======================================================

  [ROLES.EMPLOYE]: [

    PERMISSIONS.VOIR_DASHBOARD,

    // Tâches personnelles
    PERMISSIONS.VOIR_TACHES,
    PERMISSIONS.SUIVRE_TACHE,
    PERMISSIONS.TERMINER_TACHE,

    // Demandes personnelles
    PERMISSIONS.VOIR_DEMANDES,
    PERMISSIONS.CREER_DEMANDE,
    PERMISSIONS.MODIFIER_DEMANDE,

    // Rapport personnel
    PERMISSIONS.VOIR_RAPPORTS,
    PERMISSIONS.CREER_RAPPORT,
    PERMISSIONS.MODIFIER_RAPPORT,

    // Notifications
    PERMISSIONS.VOIR_NOTIFICATIONS,
    PERMISSIONS.MARQUER_NOTIFICATION_LUE,

    // Paramètres personnels
    PERMISSIONS.VOIR_PARAMETRES,
  ],


  // =======================================================
  // ADMINISTRATEUR
  // =======================================================

  [ROLES.ADMINISTRATEUR]: Object.values(PERMISSIONS),
};

ROLE_PERMISSIONS[ROLES.SOUS_DIRECTEUR] = [
  ...ROLE_PERMISSIONS[ROLES.RESPONSABLE],
  PERMISSIONS.VOIR_EMPLOYES,
];


export default ROLES;
