import { apiRequest } from "./apiRequest";
import apiClient from "../config/apiClient";

export const rapportService = {
  lister: () => apiRequest("/rapports-taches"),
  creer: (donnees, fichiers = []) => {
    if (fichiers.length === 0) {
      return apiRequest("/rapports-taches", {
        method: "POST",
        body: donnees,
      });
    }

    const formulaire = new FormData();
    Object.entries(donnees).forEach(([cle, valeur]) => {
      if (valeur !== null && valeur !== undefined) {
        formulaire.append(cle, String(valeur));
      }
    });
    fichiers.forEach((fichier) => {
      formulaire.append("pieces_jointes[]", fichier);
    });

    return apiRequest("/rapports-taches", {
      method: "POST",
      body: formulaire,
    });
  },
  decider: (id, donnees) =>
    apiRequest(`/rapports-taches/${id}`, { method: "PUT", body: donnees }),
  telechargerPieceJointe: (idRapport, idPiece) =>
    apiClient.get(
      `/rapports-taches/${idRapport}/pieces-jointes/${idPiece}`,
      { responseType: "blob" },
    ),
};
