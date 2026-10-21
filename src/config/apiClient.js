// src/config/apiClient.js
//
// Instance Axios centralisée pour GAIN OFFICE.
// Utilise la même configuration que src/config/api.js (VITE_API_URL / dev).
//
import axios from "axios";

import { API_URL } from "./api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

// Ajout automatique du token d'authentification.
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("gain_office_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Gestion centralisée des erreurs HTTP.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // En cas de session expirée, on nettoie la session locale.
    if (error?.response?.status === 401) {
      localStorage.removeItem("gain_office_token");
      localStorage.removeItem("token");
      localStorage.removeItem("gain_office_user");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;
export { api };
