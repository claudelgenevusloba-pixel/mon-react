/** Libellés partagés par l'écran des tâches. Les données viennent de Laravel. */
export const STATUTS_TACHE = [
  "À faire",
  "En cours",
  "En attente de validation",
  "Validée",
  "Correction demandée",
];

export const PRIORITES_TACHE = ["Basse", "Normale", "Haute", "Urgente"];

export const FORMULAIRE_TACHE_INITIAL = {
  titre: "",
  description: "",
  executant: "",
  priorite: "Normale",
  dateDebut: "",
  dateEcheance: "",
};
