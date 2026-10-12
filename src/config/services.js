// src/config/services.js

/**
 * =========================================================
 * GAIN OFFICE — SERVICES
 * =========================================================
 */

export const SERVICES = {

  DIRECTION: "Direction",

  RESSOURCES_HUMAINES: "Ressources humaines",

  INFORMATIQUE: "Informatique",

  ADMINISTRATION: "Administration",

  COMMERCIAL: "Commercial",

  FINANCES: "Finances",

  LOGISTIQUE: "Logistique",
};


export const SERVICES_LIST = Object.values(SERVICES);


/**
 * =========================================================
 * RECHERCHER UN SERVICE
 * =========================================================
 */

export const getServiceByName = (nom) => {

  if (!nom) {
    return null;
  }

  const recherche = String(nom)
    .trim()
    .toLowerCase();

  return (
    SERVICES_LIST.find(
      (service) =>
        service.toLowerCase() === recherche
    ) || null
  );
};


export default SERVICES;