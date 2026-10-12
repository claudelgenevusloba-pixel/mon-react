// src/config/access.js

import { PERMISSIONS } from "./permissions";
import { ROLES, ROLE_PERMISSIONS } from "./roles";

/**
 * =========================================================
 * NORMALISATION
 * =========================================================
 */

export const normaliser = (valeur) => {

  if (!valeur) {
    return "";
  }

  return String(valeur)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};


/**
 * =========================================================
 * NOM DU RÔLE
 * =========================================================
 */

export const getNomRole = (utilisateur) => {

  if (!utilisateur) {
    return "";
  }

  if (
    typeof utilisateur.role === "object" &&
    utilisateur.role !== null
  ) {

    return (
      utilisateur.role.nom ||
      utilisateur.role.libelle ||
      ""
    );
  }

  return (
    utilisateur.nom_role ||
    utilisateur.role ||
    ""
  );
};


/**
 * =========================================================
 * RÔLE
 * =========================================================
 */

export const getRole = (utilisateur) => {

  const role = normaliser(
    getNomRole(utilisateur)
  );

  if (role === "directeur") {
    return ROLES.DIRECTEUR;
  }

  if (
    role === "ressources humaines" ||
    role === "ressources_humaines" ||
    role === "rh"
  ) {
    return ROLES.RH;
  }

  if (role === "responsable") {
    return ROLES.RESPONSABLE;
  }

  if (
    role === "employe" ||
    role === "employé"
  ) {
    return ROLES.EMPLOYE;
  }

  if (
    role === "administrateur" ||
    role === "admin"
  ) {
    return ROLES.ADMINISTRATEUR;
  }

  return null;
};


/**
 * =========================================================
 * PERMISSIONS
 * =========================================================
 */

export const getPermissions = (utilisateur) => {

  const role = getRole(utilisateur);

  if (!role) {
    return [];
  }

  return ROLE_PERMISSIONS[role] || [];
};


/**
 * =========================================================
 * VÉRIFIER UNE PERMISSION
 * =========================================================
 */

export const aPermission = (
  utilisateur,
  permission
) => {

  if (!utilisateur || !permission) {
    return false;
  }

  return getPermissions(utilisateur)
    .includes(permission);
};


export const can = (
  utilisateur,
  permission
) => {

  return aPermission(
    utilisateur,
    permission
  );
};


/**
 * =========================================================
 * PLUSIEURS PERMISSIONS
 * =========================================================
 */

export const peutFaire = (
  utilisateur,
  permissions = [],
  mode = "all"
) => {

  const liste = Array.isArray(permissions)
    ? permissions
    : [permissions];

  if (liste.length === 0) {
    return true;
  }

  if (mode === "any") {

    return liste.some(
      (permission) =>
        aPermission(
          utilisateur,
          permission
        )
    );
  }

  return liste.every(
    (permission) =>
      aPermission(
        utilisateur,
        permission
      )
  );
};


/**
 * =========================================================
 * DEMANDES
 * =========================================================
 */

export const peutCreerDemande = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.CREER_DEMANDE
  );


export const peutModifierDemande = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_DEMANDE
  );


export const peutTraiterDemande = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.TRAITER_DEMANDE
  );


export const peutAccepterDemande = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.ACCEPTER_DEMANDE
  );


export const peutRefuserDemande = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.REFUSER_DEMANDE
  );


/**
 * =========================================================
 * TÂCHES
 * =========================================================
 */

export const peutCreerTache = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.CREER_TACHE
  );


export const peutModifierTache = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_TACHE
  );


export const peutSupprimerTache = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.SUPPRIMER_TACHE
  );


export const peutAssignerTache = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.ASSIGNER_TACHE
  );


export const peutTerminerTache = (
  utilisateur
) =>
  aPermission(
    utilisateur,
    PERMISSIONS.TERMINER_TACHE
  );


/**
 * =========================================================
 * MENU UTILISATEUR
 * =========================================================
 */

export const getMenuUtilisateur = (
  utilisateur
) => {

  const menu = [];


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_DASHBOARD
    )
  ) {

    menu.push({
      id: "dashboard",
      label: "Tableau de bord",
      path: "/dashboard",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_EMPLOYES
    )
  ) {

    menu.push({
      id: "employes",
      label: "Employés",
      path: "/employes",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_TACHES
    )
  ) {

    menu.push({
      id: "taches",
      label: "Tâches",
      path: "/taches",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_DEMANDES
    )
  ) {

    menu.push({
      id: "demandes",
      label: "Demandes",
      path: "/demandes",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_RAPPORTS
    )
  ) {

    menu.push({
      id: "rapports",
      label: "Rapports",
      path: "/rapports",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_NOTIFICATIONS
    )
  ) {

    menu.push({
      id: "notifications",
      label: "Notifications",
      path: "/notifications",
    });
  }


  if (
    aPermission(
      utilisateur,
      PERMISSIONS.VOIR_PARAMETRES
    )
  ) {

    menu.push({
      id: "parametres",
      label: "Paramètres",
      path: "/parametres",
    });
  }


  return menu;
};


/**
 * =========================================================
 * SERVICE
 * =========================================================
 */

export const getServiceUtilisateur = (
  utilisateur
) => {

  return (
    utilisateur?.employe?.poste?.service?.nom ||
    utilisateur?.employe?.poste?.service?.libelle ||
    utilisateur?.service?.nom ||
    utilisateur?.service?.libelle ||
    utilisateur?.service ||
    null
  );
};


/**
 * =========================================================
 * POSTE
 * =========================================================
 */

export const getPosteUtilisateur = (
  utilisateur
) => {

  return (
    utilisateur?.employe?.poste?.nom ||
    utilisateur?.employe?.poste?.libelle ||
    utilisateur?.poste?.nom ||
    utilisateur?.poste?.libelle ||
    utilisateur?.poste ||
    null
  );
};


/**
 * =========================================================
 * CONTEXTE UTILISATEUR
 * =========================================================
 */

export const getContexteUtilisateur = (
  utilisateur
) => {

  if (!utilisateur) {

    return {

      role: null,

      nomRole: "",

      service: null,

      poste: null,

      permissions: [],

      menu: [],

      authentifie: false,
    };
  }


  return {

    role: getRole(utilisateur),

    nomRole: getNomRole(utilisateur),

    service:
      getServiceUtilisateur(
        utilisateur
      ),

    poste:
      getPosteUtilisateur(
        utilisateur
      ),

    permissions:
      getPermissions(
        utilisateur
      ),

    menu:
      getMenuUtilisateur(
        utilisateur
      ),

    authentifie: true,
  };
};


/**
 * =========================================================
 * ANALYSER UTILISATEUR
 * =========================================================
 */

export const analyserUtilisateur = (
  utilisateur
) => {

  const contexte =
    getContexteUtilisateur(
      utilisateur
    );


  return {

    utilisateur,

    role:
      contexte.role,

    nomRole:
      contexte.nomRole,

    permissions:
      contexte.permissions,

    menu:
      contexte.menu,

    service:
      contexte.service,

    poste:
      contexte.poste,

    authentifie:
      contexte.authentifie,
  };
};


/**
 * =========================================================
 * EXPORT PAR DÉFAUT
 * =========================================================
 */

export default {

  PERMISSIONS,

  ROLES,

  normaliser,

  getNomRole,

  getRole,

  getPermissions,

  aPermission,

  can,

  peutFaire,

  peutCreerDemande,

  peutModifierDemande,

  peutTraiterDemande,

  peutAccepterDemande,

  peutRefuserDemande,

  peutCreerTache,

  peutModifierTache,

  peutSupprimerTache,

  peutAssignerTache,

  peutTerminerTache,

  getMenuUtilisateur,

  getServiceUtilisateur,

  getPosteUtilisateur,

  getContexteUtilisateur,

  analyserUtilisateur,
};