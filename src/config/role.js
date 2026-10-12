// src/config/role.js

import { ROLES } from "./roles";

/**
 * =========================================================
 * GAIN OFFICE — INFORMATIONS DES RÔLES
 * =========================================================
 */

export const ROLE_INFO = {

  // =======================================================
  // DIRECTEUR
  // =======================================================

  [ROLES.DIRECTEUR]: {

    nom: ROLES.DIRECTEUR,

    niveau: 1,

    description:
      "Direction générale, contrôle et validation de l'entreprise.",

    peutProduireRapport: false,

    peutValiderRapport: true,

    peutControlerRapport: true,
  },


  // =======================================================
  // RH
  // =======================================================

  [ROLES.RH]: {

    nom: ROLES.RH,

    niveau: 2,

    description:
      "Gestion des ressources humaines et administration du personnel.",

    peutProduireRapport: true,

    peutValiderRapport: false,

    peutControlerRapport: false,
  },


  // =======================================================
  // RESPONSABLE
  // =======================================================

  [ROLES.RESPONSABLE]: {

    nom: ROLES.RESPONSABLE,

    niveau: 3,

    description:
      "Gestion et supervision d'une équipe ou d'un service.",

    peutProduireRapport: true,

    peutValiderRapport: true,

    peutControlerRapport: false,
  },


  // =======================================================
  // EMPLOYÉ
  // =======================================================

  [ROLES.EMPLOYE]: {

    nom: ROLES.EMPLOYE,

    niveau: 4,

    description:
      "Exécution des tâches et activités attribuées.",

    peutProduireRapport: true,

    peutValiderRapport: false,

    peutControlerRapport: false,
  },


  // =======================================================
  // ADMINISTRATEUR
  // =======================================================

  [ROLES.ADMINISTRATEUR]: {

    nom: ROLES.ADMINISTRATEUR,

    niveau: 0,

    description:
      "Administration technique complète de l'application.",

    peutProduireRapport: true,

    peutValiderRapport: true,

    peutControlerRapport: true,
  },
};


/**
 * =========================================================
 * FONCTIONS
 * =========================================================
 */

export const getRoleInfo = (role) => {

  return ROLE_INFO[role] || null;
};


export const peutProduireRapport = (role) => {

  return (
    ROLE_INFO[role]?.peutProduireRapport === true
  );
};


export const peutValiderRapport = (role) => {

  return (
    ROLE_INFO[role]?.peutValiderRapport === true
  );
};


export const peutControlerRapport = (role) => {

  return (
    ROLE_INFO[role]?.peutControlerRapport === true
  );
};


export const getNiveauRole = (role) => {

  return ROLE_INFO[role]?.niveau ?? null;
};


export default ROLE_INFO;