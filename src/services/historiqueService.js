import { apiRequest } from "./apiRequest";

export const historiqueService = {
  lister: (params = {}) => apiRequest("/historique-actions", { params }),
};
