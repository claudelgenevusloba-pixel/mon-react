import apiClient from "../config/apiClient";

function normaliserCorps(body) {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function messageErreur(data, fallback) {
  const messagesValidation = Object.values(data?.errors || {})
    .flat()
    .filter(Boolean);

  return (
    data?.message ||
    messagesValidation.join(" | ") ||
    fallback
  );
}

/** Couche HTTP commune aux services métier, basée sur l'instance Axios. */
export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers, params, signal } = options;

  try {
    const response = await apiClient.request({
      url: endpoint,
      method: method.toLowerCase(),
      data: normaliserCorps(body),
      headers,
      params,
      signal,
    });

    return response.data || {};
  } catch (error) {
    const data = error?.response?.data || {};
    const erreurNormalisee = new Error(
      messageErreur(data, "Erreur de communication avec le serveur.")
    );

    erreurNormalisee.response = error?.response;
    erreurNormalisee.cause = error;
    throw erreurNormalisee;
  }
}
