import { apiRequest } from "./apiRequest";

export const employeService = {
  list: () => apiRequest("/employes"),
  roles: () => apiRequest("/roles"),
  rolesDisponibles: () => apiRequest("/roles-disponibles"),
  services: () => apiRequest("/services"),
  postes: () => apiRequest("/postes"),

  inviter: (donnees, photo) => {
    if (!photo) {
      return apiRequest("/invitations", {
        method: "POST",
        body: donnees,
      });
    }

    const formulaire = new FormData();
    Object.entries(donnees).forEach(([cle, valeur]) => {
      formulaire.append(cle, valeur == null ? "" : String(valeur));
    });
    formulaire.append("photo", photo);

    return apiRequest("/invitations", {
      method: "POST",
      body: formulaire,
    });
  },

  modifier: (id, donnees, photo) => {
    if (!photo) {
      return apiRequest(`/employes/${id}`, {
        method: "PUT",
        body: donnees,
      });
    }

    const formulaire = new FormData();
    Object.entries(donnees).forEach(([cle, valeur]) => {
      formulaire.append(cle, valeur == null ? "" : String(valeur));
    });
    formulaire.append("photo", photo);
    formulaire.append("_method", "PUT");

    return apiRequest(`/employes/${id}`, {
      method: "POST",
      body: formulaire,
    });
  },

  changerStatut: (id, statut) =>
    apiRequest(`/employes/${id}`, {
      method: "PUT",
      body: { statut },
    }),

  desactiver: (id) =>
    apiRequest(`/employes/${id}`, {
      method: "DELETE",
    }),

  renvoyerInvitation: (id) =>
    apiRequest(`/invitations/${id}/renvoyer`, {
      method: "POST",
    }),
};
