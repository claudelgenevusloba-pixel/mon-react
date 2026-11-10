import { apiRequest } from "./apiRequest";

export const tacheService = {
  lister: () => apiRequest("/taches"),
  assignables: () => apiRequest("/taches/assignables"),
  details: (id) => apiRequest(`/taches/${id}`),
  creer: (donnees) => apiRequest("/taches", { method: "POST", body: donnees }),
  modifier: (id, donnees) =>
    apiRequest(`/taches/${id}`, { method: "PUT", body: donnees }),
  supprimer: (id) => apiRequest(`/taches/${id}`, { method: "DELETE" }),
  commenter: (id, contenu) =>
    apiRequest(`/taches/${id}/messages`, {
      method: "POST",
      body: { contenu },
    }),
};
