// src/config/api.js
//
// URL de base de l'API GAIN OFFICE.
//
// - Sur le PC (localhost:5173) : http://localhost:8000/api
// - Sur un téléphone (192.168.x.x:5173, même Wi-Fi) :
//   http://192.168.x.x:8000/api
//
// On déduit automatiquement l'hôte de l'origine de la page,
// ce qui permet de tester le QR code entre PC et téléphone
// sans modifier le code. VITE_API_URL permet une surcharge.

const hote = window.location.hostname || "127.0.0.1";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  `http://${hote}:8000/api`;

export default API_URL;
