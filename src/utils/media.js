import { API_URL } from "../config/api";

function getApiOrigin() {
  const candidate = API_URL || window.location.origin;

  try {
    return new URL(candidate, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function getPublicImageUrl(source) {
  if (!source || typeof source !== "string") return "";

  const value = source.trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const origin = getApiOrigin();
  const path = value.replace(/^\/+/, "");
  const publicPath = path.startsWith("storage/")
    ? path
    : `storage/${path}`;

  return `${origin}/${publicPath}`;
}
