import React, {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  analyserUtilisateur,
  getPermissions,
  aPermission,
  getMenuUtilisateur,
  getContexteUtilisateur,
} from "../config/access";

const AuthContext = createContext(null);

/**
 * =========================================================
 * UTILITAIRE — LECTURE UTILISATEUR LOCAL
 * =========================================================
 */

function lireUtilisateurStocke() {
  try {
    const utilisateurStocke =
      localStorage.getItem("gain_office_user") ||
      localStorage.getItem("user");

    if (!utilisateurStocke) {
      return null;
    }

    return JSON.parse(utilisateurStocke);

  } catch (error) {

    console.error(
      "Erreur lecture utilisateur :",
      error
    );

    return null;
  }
}

/**
 * =========================================================
 * PROVIDER
 * =========================================================
 */

export function AuthProvider({ children }) {

  const [
    utilisateur,
    setUtilisateurState,
  ] = useState(
    lireUtilisateurStocke
  );

  useEffect(() => {
    const gererSessionExpiree = () => {
      setUtilisateurState(null);
      localStorage.removeItem("gain_office_user");
      localStorage.removeItem("user");
    };

    window.addEventListener(
      "gain-office:session-expired",
      gererSessionExpiree
    );

    return () => {
      window.removeEventListener(
        "gain-office:session-expired",
        gererSessionExpiree
      );
    };
  }, []);

  /**
   * =======================================================
   * UTILISATEUR
   * =======================================================
   */

  const setUtilisateur = (
    utilisateurNouveau
  ) => {

    setUtilisateurState(
      utilisateurNouveau
    );

    if (!utilisateurNouveau) {

      localStorage.removeItem(
        "gain_office_user"
      );

      localStorage.removeItem(
        "user"
      );

      return;
    }

    localStorage.setItem(
      "gain_office_user",
      JSON.stringify(
        utilisateurNouveau
      )
    );

    localStorage.setItem(
      "user",
      JSON.stringify(
        utilisateurNouveau
      )
    );
  };

  /**
   * =======================================================
   * CONNEXION
   * =======================================================
   */

  const connecter = (
    utilisateurConnecte
  ) => {

    if (!utilisateurConnecte) {
      return;
    }

    setUtilisateur(
      utilisateurConnecte
    );
  };

  /**
   * =======================================================
   * DÉCONNEXION
   * =======================================================
   */

  const deconnecter = () => {

    setUtilisateurState(null);

    localStorage.removeItem(
      "gain_office_user"
    );

    localStorage.removeItem(
      "user"
    );
  };

  /**
   * =======================================================
   * INFORMATIONS UTILISATEUR
   * =======================================================
   */

  const informations = useMemo(() => {

    if (!utilisateur) {
      return null;
    }

    return analyserUtilisateur(
      utilisateur
    );

  }, [utilisateur]);

  /**
   * =======================================================
   * PERMISSIONS
   * =======================================================
   */

  const permissions = useMemo(() => {

    if (!utilisateur) {
      return [];
    }

    return getPermissions(
      utilisateur
    );

  }, [utilisateur]);

  /**
   * =======================================================
   * MENU
   * =======================================================
   */

  const menu = useMemo(() => {

    if (!utilisateur) {
      return [];
    }

    return getMenuUtilisateur(
      utilisateur
    );

  }, [utilisateur]);

  /**
   * =======================================================
   * CONTEXTE UTILISATEUR
   * =======================================================
   */

  const contexte = useMemo(() => {

    if (!utilisateur) {
      return null;
    }

    return getContexteUtilisateur(
      utilisateur
    );

  }, [utilisateur]);

  /**
   * =======================================================
   * VÉRIFICATION PERMISSION
   * =======================================================
   */

  const can = (
    permission
  ) => {

    if (!utilisateur) {
      return false;
    }

    return aPermission(
      utilisateur,
      permission
    );
  };

  /**
   * =======================================================
   * ÉTAT DE CONNEXION
   * =======================================================
   */

  const estConnecte =
    utilisateur !== null;

  /**
   * =======================================================
   * VALEUR DU CONTEXTE
   * =======================================================
   */

  const valeur = useMemo(
    () => ({
      utilisateur,

      setUtilisateur,

      connecter,

      deconnecter,

      estConnecte,

      permissions,

      menu,

      informations,

      contexte,

      can,
    }),
    [
      utilisateur,
      estConnecte,
      permissions,
      menu,
      informations,
      contexte,
    ]
  );

  return (
    <AuthContext.Provider
      value={valeur}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * =========================================================
 * HOOK — USE AUTH
 * =========================================================
 */

export function useAuth() {

  const contexte =
    useContext(
      AuthContext
    );

  if (!contexte) {

    throw new Error(
      "useAuth doit être utilisé à l'intérieur de AuthProvider"
    );
  }

  return contexte;
}

export default AuthContext;
