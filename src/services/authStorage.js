const STORAGE_KEYS = {
  token: ["gain_office_token", "token"],
  user: ["gain_office_user", "user"],
};

function lirePremier(cles) {
  for (const cle of cles) {
    const valeur = localStorage.getItem(cle);
    if (valeur) return valeur;
  }

  return null;
}

export const authStorage = {
  getToken() {
    return lirePremier(STORAGE_KEYS.token) || "";
  },

  getUser() {
    try {
      const valeur = lirePremier(STORAGE_KEYS.user);
      return valeur ? JSON.parse(valeur) : null;
    } catch {
      return null;
    }
  },

  setToken(token) {
    if (!token) return;
    STORAGE_KEYS.token.forEach((cle) => localStorage.setItem(cle, token));
  },

  setUser(user) {
    if (!user) {
      STORAGE_KEYS.user.forEach((cle) => localStorage.removeItem(cle));
      return;
    }

    const valeur = JSON.stringify(user);
    STORAGE_KEYS.user.forEach((cle) => localStorage.setItem(cle, valeur));
  },

  clearUser() {
    STORAGE_KEYS.user.forEach((cle) => localStorage.removeItem(cle));
  },

  clear() {
    [...STORAGE_KEYS.token, ...STORAGE_KEYS.user].forEach((cle) =>
      localStorage.removeItem(cle)
    );
  },
};
