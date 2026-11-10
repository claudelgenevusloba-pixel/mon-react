import { apiRequest } from "./apiRequest";

export const demandeService = {
  lister: () => apiRequest("/demandes"),
  creer: (body) => apiRequest("/demandes", { method: "POST", body }),
  traiter: (id, body) => apiRequest(`/demandes/${id}`, { method: "PUT", body }),
  annuler: (id) => apiRequest(`/demandes/${id}`, {
    method: "PUT",
    body: { statut: "annulee" },
  }),
};
