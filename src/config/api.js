
const hote = window.location.hostname || "127.0.0.1";
const apiConfiguree = import.meta.env.VITE_API_URL?.trim();

// URL publique HTTPS de l'API en production (ex. "https://monsite.infinityfreeapp.com/api").
// Priorité à la variable d'environnement VITE_API_URL (à définir dans le tableau
// de bord Netlify) ; cette constante sert de repli si la variable est absente
// au moment du build. Vide = comportement actuel (URL relative, uniquement
// valable si le frontend et l'API partagent le même domaine).
const API_URL_PROD = "";

const API_URL = (
  apiConfiguree ||
  (import.meta.env.DEV ? `http://${hote}:8000/api` : API_URL_PROD)
).replace(/\/$/, "");

export { API_URL };
export default API_URL;
