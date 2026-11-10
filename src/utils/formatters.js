export function normaliserTexte(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getInitials(value, fallback = "GO") {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return fallback;
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function formaterNombre(value, locale = "fr-FR") {
  const number = Number(value);
  return new Intl.NumberFormat(locale).format(
    Number.isFinite(number) ? number : 0
  );
}

export function lireNomComplet(utilisateur, fallback = "Utilisateur") {
  if (!utilisateur) return fallback;

  const name = [utilisateur.prenom, utilisateur.nom]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || utilisateur.nom_complet || utilisateur.name || fallback;
}
