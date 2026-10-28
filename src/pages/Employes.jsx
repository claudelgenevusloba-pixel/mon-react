import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { formaterDateSelonPreference } from "../context/LanguageContext";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  Copy,
  AlertCircle,
  LoaderCircle,
  QrCode,
} from "lucide-react";

import "../styles/pages/employes.css";

import { PERMISSIONS } from "../config/permissions";
import { aPermission, getRole, normaliser } from "../config/access";
import { ROLES } from "../config/roles";

import apiClient from "../config/apiClient";

/* ============================================================
   UTILITAIRES
============================================================ */

function initiales(nom = "") {
  return nom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("");
}

function statutTexte(statut) {
  if (statut === "actif") return "Actif";
  if (statut === "inactif" || statut === "bloque") {
    return "Inactif";
  }

  return "En attente";
}

function roleTexte(role) {
  if (!role) return "Employé";

  if (
    String(role).toLowerCase() === "employe" ||
    String(role).toLowerCase() === "employé"
  ) {
    return "Employé";
  }

  return role;
}

function formatDate(date) {
  if (!date) return "Non renseignée";

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return date;
  }

  return formaterDateSelonPreference(valeur, "Non renseignée");
}

/* ============================================================
   WHATSAPP
============================================================ */

function normaliserNumeroWhatsApp(numero = "") {
  const brut = String(numero).trim();

  if (!brut) return "";

  const chiffres = brut.replace(/\D/g, "");

  if (
    chiffres.startsWith("225") &&
    chiffres.length >= 12
  ) {
    return chiffres;
  }

  if (
    chiffres.length === 10 &&
    ["01", "05", "07"].includes(
      chiffres.slice(0, 2)
    )
  ) {
    return `225${chiffres}`;
  }

  if (chiffres.length === 8) {
    return `225${chiffres}`;
  }

  return chiffres;
}

function ouvrirWhatsAppInvitation(
  employe,
  activationUrl
) {
  const numero =
    normaliserNumeroWhatsApp(
      employe?.telephone
    );

  if (!numero || !activationUrl) {
    return false;
  }

  const prenom =
    employe?.prenom ||
    employe?.nom?.split(" ")[0] ||
    "Bonjour";

  const message =
    `Bonjour ${prenom},\n\n` +
    `Votre compte GAIN OFFICE a été créé.\n` +
    `Veuillez activer votre compte en ouvrant ce lien :\n\n` +
    `${activationUrl}\n\n` +
    `Après activation, vous pourrez définir votre mot de passe et vous connecter à GAIN OFFICE.\n\n` +
    `Merci.`;

  const url =
    `https://wa.me/${numero}` +
    `?text=${encodeURIComponent(message)}`;

  const fenetre = window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  if (!fenetre) {
    window.location.href = url;
  }

  return true;
}

/* ============================================================
   NORMALISATION EMPLOYÉ
============================================================ */

function normaliserEmploye(item) {
  const utilisateur =
    item?.utilisateur || {};

  const poste =
    item?.poste || {};

  const service =
    poste?.service || {};

  const role =
    utilisateur?.role || {};

  const nomComplet =
    `${utilisateur.prenom || ""} ${
      utilisateur.nom || ""
    }`
      .trim()
      .replace(/\s+/g, " ");

  return {
    id: item?.id_employe,

    idUtilisateur:
      item?.id_utilisateur,

    idRole:
      role?.id_role ||
      utilisateur?.id_role ||
      "",

    idPoste:
      item?.id_poste ||
      poste?.id_poste ||
      "",

    nom:
      nomComplet || "Employé",

    prenom:
      utilisateur?.prenom || "",

    nomFamille:
      utilisateur?.nom || "",

    email:
      utilisateur?.email || "",

    telephone:
      utilisateur?.telephone ||
      "Non renseigné",

    poste:
      poste?.libelle ||
      poste?.nom ||
      "Non renseigné",

    departement:
      service?.nom ||
      service?.libelle ||
      "Non renseigné",

    role:
      roleTexte(role?.nom),

    idResponsable:
      utilisateur?.id_responsable || null,

    statut:
      statutTexte(
        utilisateur?.statut
      ),

    invitation:
      utilisateur?.statut === "actif"
        ? "Activé"
        : "Invitation en attente",

    dateArrivee:
      formatDate(
        item?.date_embauche
      ),

    matricule:
      item?.matricule || "",

    adresse:
      item?.adresse || "",

    ville:
      item?.ville || "",

    photo:
      utilisateur?.photo ||
      item?.photo_identite ||
      "",

    initiales:
      initiales(nomComplet),
  };
}

/* ============================================================
   AVATAR
============================================================ */

function Avatar({
  employe,
  large = false,
}) {
  return (
    <div
      className={
        large
          ? "employee-avatar employee-avatar-large"
          : "employee-avatar"
      }
    >
      {employe?.photo ? (
        <img
          src={employe.photo}
          alt={employe.nom}
        />
      ) : (
        employe?.initiales ||
        initiales(employe?.nom)
      )}
    </div>
  );
}

/* ============================================================
   COMPOSANT
============================================================ */

export default function Employes({
  utilisateur,
}) {
  const { t } = useLanguage();
  const [employes, setEmployes] =
    useState([]);

  const [rolesAPI, setRolesAPI] =
    useState([]);

  const [
    rolesDisponibles,
    setRolesDisponibles,
  ] = useState([]);

  const [services, setServices] =
    useState([]);

  const [postes, setPostes] =
    useState([]);

  const [recherche, setRecherche] =
    useState("");

  const [departement, setDepartement] =
    useState(
      "Tous les départements"
    );

  const [role, setRole] =
    useState("Tous les rôles");

  const [statut, setStatut] =
    useState("Tous les statuts");

  const [page, setPage] =
    useState(1);

  const [modal, setModal] =
    useState(null);

  const [
    employeSelectionne,
    setEmployeSelectionne,
  ] = useState(null);

  const [menuOuvert, setMenuOuvert] =
    useState(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const menuButtonRef =
    useRef(null);

  const [toast, setToast] =
    useState(null);

  /*
   * QR code d'inscription affiché au RH :
   * { url, expiresAt, employe }
   */
  const [qr, setQr] = useState(null);

  /* Horloge du compte à rebours du QR (1 tick/seconde). */
  const [now, setNow] = useState(() => Date.now());

  const [chargement, setChargement] =
    useState(true);

  const [
    enregistrement,
    setEnregistrement,
  ] = useState(false);

  const [erreur, setErreur] =
    useState("");

  const [formulaire, setFormulaire] =
    useState({
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      matricule: "",

      id_role: "",
      role: "Employé",

      id_service: "",
      service: "",

      id_poste: "",
      poste: "",

      date_embauche: "",
      date_naissance: "",

      adresse: "",
      ville: "",

      id_responsable: "",

      mot_de_passe: "",
    });

  /* ============================================================
     PERMISSIONS
  ============================================================ */

  const peutVoirEmployes =
    [ROLES.ADMINISTRATEUR, ROLES.DIRECTEUR, ROLES.RH, ROLES.SOUS_DIRECTEUR]
      .includes(getRole(utilisateur)) &&
    aPermission(utilisateur, PERMISSIONS.VOIR_EMPLOYES);

  const peutCreerEmploye =
    aPermission(
      utilisateur,
      PERMISSIONS.CREER_EMPLOYE
    );

  const peutModifierEmploye =
    aPermission(
      utilisateur,
      PERMISSIONS.MODIFIER_EMPLOYE
    );

  const peutSupprimerEmploye =
    aPermission(
      utilisateur,
      PERMISSIONS.SUPPRIMER_EMPLOYE
    );

  /* ============================================================
     TOAST
  ============================================================ */

  const afficherToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* ============================================================
     COMPTE À REBOURS DU QR CODE (15 minutes)
  ============================================================ */

  useEffect(() => {
    if (!qr) {
      return;
    }

    const minuteur = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(minuteur);
  }, [qr]);

  /* ============================================================
     ÉTAT DU COMPTE À REBOURS DU QR
  ============================================================ */

  const qrExpire = qr?.expiresAt
    ? new Date(qr.expiresAt).getTime() <= now
    : false;

  const qrSecondesRestantes = qr?.expiresAt
    ? Math.max(
        0,
        Math.floor(
          (new Date(qr.expiresAt).getTime() - now) / 1000
        )
      )
    : null;

  const qrMinuteur = qrSecondesRestantes !== null
    ? `${String(
        Math.floor(qrSecondesRestantes / 60)
      ).padStart(2, "0")}:${String(
        qrSecondesRestantes % 60
      ).padStart(2, "0")}`
    : "--:--";

  /*
   * URL d'activation accessible depuis le téléphone.
   *
   * Le backend génère le lien avec FRONTEND_URL (souvent
   * localhost). Le QR code doit être scannable par un autre
   * appareil : on remplace donc l'origine par celle de la
   * page actuelle (IP locale en test Wi-Fi). Le token est
   * inchangé.
   */
  let qrUrlAccessible = qr?.url || "";

  if (qr?.url) {
    try {
      const urlObj = new URL(qr.url);

      qrUrlAccessible =
        window.location.origin +
        urlObj.pathname +
        urlObj.search;
    } catch {
      qrUrlAccessible = qr.url;
    }
  }

  /* ============================================================
     API
  ============================================================ */

  const api = async (
    endpoint,
    options = {}
  ) => {
    const headers = {
      Accept:
        "application/json",
      ...(options.headers || {}),
    };

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {
      headers["Content-Type"] =
        "application/json";
    }

    let response;
    let data = {};

    try {
      response = await apiClient.request({
        url: endpoint,
        method: (options.method || "GET").toLowerCase(),
        headers,
        data:
          options.body && !(options.body instanceof FormData)
            ? JSON.parse(options.body)
            : options.body,
      });

      data = response.data || {};
    } catch (error) {
      const errData = error?.response?.data || {};
      data = errData;

      let message =
        errData?.message ||
        "Erreur de communication avec le serveur.";

      if (errData?.errors) {
        const erreurs = Object.entries(errData.errors)
          .map(([champ, messages]) =>
            `${champ} : ${Array.isArray(messages) ? messages.join(", ") : messages}`
          )
          .join(" | ");

        if (erreurs) {
          message += ` — ${erreurs}`;
        }
      }

      throw new Error(message);
    }

    return data;
  };

  /* ============================================================
     CHARGEMENT
  ============================================================ */

  const chargerDonnees =
    async (silencieux = false) => {
      try {
        if (!silencieux) {
          setChargement(true);
        }
        setErreur("");

        const [
          employesData,
          rolesData,
          rolesDisponiblesData,
          servicesData,
          postesData,
        ] = await Promise.all([
          api("/employes"),
          api("/roles"),
          api("/roles-disponibles"),
          api("/services"),
          api("/postes"),
        ]);

        const listeEmployes =
          Array.isArray(
            employesData?.employes
          )
            ? employesData.employes
            : Array.isArray(
                employesData?.data
              )
            ? employesData.data
            : Array.isArray(
                employesData
              )
            ? employesData
            : [];

        const listeRoles =
          Array.isArray(
            rolesData?.roles
          )
            ? rolesData.roles
            : Array.isArray(
                rolesData?.data
              )
            ? rolesData.data
            : Array.isArray(
                rolesData
              )
            ? rolesData
            : [];

        const listeRolesDisponibles =
          Array.isArray(
            rolesDisponiblesData?.roles
          )
            ? rolesDisponiblesData.roles
            : Array.isArray(
                rolesDisponiblesData?.data
              )
            ? rolesDisponiblesData.data
            : Array.isArray(
                rolesDisponiblesData
              )
            ? rolesDisponiblesData
            : [];

        const listeServices =
          Array.isArray(
            servicesData?.services
          )
            ? servicesData.services
            : Array.isArray(
                servicesData?.data
              )
            ? servicesData.data
            : Array.isArray(
                servicesData
              )
            ? servicesData
            : [];

        const listePostes =
          Array.isArray(
            postesData?.postes
          )
            ? postesData.postes
            : Array.isArray(
                postesData?.data
              )
            ? postesData.data
            : Array.isArray(
                postesData
              )
            ? postesData
            : [];

        setEmployes(
          listeEmployes
            .map(normaliserEmploye)
            .filter((employe) => !["directeur", "sous-directeur", "sous directeur", "sous_directeur"].includes(normaliser(employe.role)))
        );

        setRolesAPI(
          listeRoles
        );

        setRolesDisponibles(
          listeRolesDisponibles
        );

        setServices(
          listeServices
        );

        setPostes(
          listePostes
        );
      } catch (error) {
        console.error(error);

        setErreur(
          error.message ||
            "Impossible de charger les employés."
        );

        afficherToast(
          error.message ||
            "Impossible de charger les employés.",
          "error"
        );
      } finally {
        setChargement(false);
      }
    };

  /* ============================================================
     RAFRAÎCHISSEMENT AUTOMATIQUE — INSCRIPTIONS EN ATTENTE
     ----------------------------------------------------------
     Tant qu'une invitation est en attente, l'écran RH se
     rafraîchit toutes les 20 secondes et signale la fin
     d'une inscription.
  ============================================================ */

  const invitationsEnAttenteRef = useRef({});

  useEffect(() => {
    const enAttente = employes.filter(
      (element) =>
        element.invitation === "Invitation en attente"
    );

    /*
     * Détection des inscriptions terminées :
     * un employé qui passait de "Invitation en attente"
     * à "Activé" déclenche un toast.
     */
    enAttente.forEach((element) => {
      const precedent =
        invitationsEnAttenteRef.current[element.id];

      if (precedent === undefined) {
        invitationsEnAttenteRef.current[element.id] =
          "Invitation en attente";
      }
    });

    employes.forEach((element) => {
      const precedent =
        invitationsEnAttenteRef.current[element.id];

      if (
        precedent === "Invitation en attente" &&
        element.invitation === "Activé"
      ) {
        afficherToast(
          `Inscription de ${element.nom} terminée. Le compte est actif.`,
          "success"
        );

        delete invitationsEnAttenteRef.current[element.id];
      }
    });

    if (enAttente.length === 0) {
      invitationsEnAttenteRef.current = {};
      return undefined;
    }

    const minuteur = setInterval(() => {
      chargerDonnees(true);
    }, 20000);

    return () => clearInterval(minuteur);
  }, [employes]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  /* ============================================================
     FERMETURE DU MENU
  ============================================================ */

  useEffect(() => {
    const fermerMenu = (
      event
    ) => {
      if (
        menuOuvert !== null &&
        !event.target.closest(
          ".employee-floating-menu"
        ) &&
        !event.target.closest(
          ".employee-more-trigger"
        )
      ) {
        setMenuOuvert(null);
      }
    };

    document.addEventListener(
      "mousedown",
      fermerMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        fermerMenu
      );
    };
  }, [menuOuvert]);

  useEffect(() => {
    if (menuOuvert === null) {
      return;
    }

    const fermerSurScroll =
      () => {
        setMenuOuvert(null);
      };

    window.addEventListener(
      "scroll",
      fermerSurScroll,
      true
    );

    window.addEventListener(
      "resize",
      fermerSurScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        fermerSurScroll,
        true
      );

      window.removeEventListener(
        "resize",
        fermerSurScroll
      );
    };
  }, [menuOuvert]);

  /* ============================================================
     FILTRES
  ============================================================ */

  const departements =
    useMemo(() => {
      const noms =
        services
          .map(
            (service) =>
              service?.nom ||
              service?.libelle
          )
          .filter(Boolean);

      return [
        "Tous les départements",
        ...new Set(noms),
      ];
    }, [services]);

  const roles =
    useMemo(() => {
      return rolesAPI
        .map((element) =>
          roleTexte(
            element?.nom ||
              element?.libelle
          )
        )
        .filter((nomRole) => !["directeur", "sous-directeur", "sous directeur", "sous_directeur"].includes(normaliser(nomRole)))
        .filter(Boolean);
    }, [rolesAPI]);

  const employesFiltres =
    useMemo(() => {
      const texte =
        recherche
          .toLowerCase()
          .trim();

      return employes.filter(
        (employe) => {
          const rechercheOK =
            !texte ||
            employe.nom
              .toLowerCase()
              .includes(texte) ||
            employe.email
              .toLowerCase()
              .includes(texte) ||
            employe.poste
              .toLowerCase()
              .includes(texte) ||
            employe.departement
              .toLowerCase()
              .includes(texte) ||
            employe.matricule
              .toLowerCase()
              .includes(texte);

          const departementOK =
            departement ===
              "Tous les départements" ||
            employe.departement ===
              departement;

          const roleOK =
            role ===
              "Tous les rôles" ||
            employe.role === role;

          const statutOK =
            statut ===
              "Tous les statuts" ||
            employe.statut ===
              statut;

          return (
            rechercheOK &&
            departementOK &&
            roleOK &&
            statutOK
          );
        }
      );
    }, [
      employes,
      recherche,
      departement,
      role,
      statut,
    ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const elementsParPage = 5;
    const totalPages =
    Math.max(
      1,
      Math.ceil(
        employesFiltres.length /
          elementsParPage
      )
    );

  const pageActuelle =
    Math.min(
      page,
      totalPages
    );

  const employesAffiches =
    employesFiltres.slice(
      (pageActuelle - 1) *
        elementsParPage,
      pageActuelle *
        elementsParPage
    );

  /* ============================================================
     STATISTIQUES
  ============================================================ */

  const totalEmployes =
    employes.length;

  const employesActifs =
    employes.filter(
      (element) =>
        element.statut ===
        "Actif"
    ).length;

  const invitationsEnAttente =
    employes.filter(
      (element) =>
        element.invitation ===
        "Invitation en attente"
    ).length;

  const responsables =
    employes.filter(
      (element) =>
        [
          "Directeur",
          "RH",
          "Responsable",
        ].includes(
          element.role
        )
    ).length;

  /* ============================================================
     MENU ACTIONS
  ============================================================ */

  const ouvrirMenu = (
    event,
    employeId
  ) => {
    event.stopPropagation();

    if (
      menuOuvert ===
      employeId
    ) {
      setMenuOuvert(null);
      return;
    }

    const bouton =
      event.currentTarget;

    menuButtonRef.current =
      bouton;

    const rect =
      bouton.getBoundingClientRect();

    const menuWidth = 225;
    const menuHeight = 260;
    const marge = 8;

    let left =
      rect.right -
      menuWidth;

    let top =
      rect.bottom +
      marge;

    if (
      left + menuWidth >
      window.innerWidth - 10
    ) {
      left =
        window.innerWidth -
        menuWidth -
        10;
    }

    if (left < 10) {
      left = 10;
    }

    if (
      top + menuHeight >
      window.innerHeight - 10
    ) {
      top =
        rect.top -
        menuHeight -
        marge;
    }

    if (top < 10) {
      top = 10;
    }

    setMenuPosition({
      top,
      left,
    });

    setMenuOuvert(
      employeId
    );
  };

  const fermerMenu = () => {
    setMenuOuvert(null);
  };

  /* ============================================================
     FORMULAIRES
  ============================================================ */

  const ouvrirInvitation =
    () => {
      const roleEmploye =
        rolesAPI.find(
          (element) => {
            const nom =
              String(
                element?.nom ||
                  element?.libelle ||
                  ""
              ).toLowerCase();

            return (
              nom === "employe" ||
              nom === "employé"
            );
          }
        );

      setFormulaire({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        matricule: "",

        id_role:
          roleEmploye?.id_role ||
          "",

        role:
          roleEmploye?.nom ||
          roleEmploye?.libelle ||
          "Employé",

        id_service: "",
        service: "",

        id_poste: "",
        poste: "",

        date_embauche: "",
        date_naissance: "",

        adresse: "",
        ville: "",

        id_responsable: "",

        mot_de_passe: "",
      });

      setEmployeSelectionne(
        null
      );

      setModal(
        "invitation"
      );

      fermerMenu();
    };

  const ouvrirModification = (
    employe
  ) => {
    const posteActuel =
      postes.find(
        (poste) =>
          Number(
            poste?.id_poste
          ) ===
          Number(
            employe.idPoste
          )
      );

    setEmployeSelectionne(
      employe
    );

    setFormulaire({
      prenom:
        employe.prenom,

      nom:
        employe.nomFamille,

      email:
        employe.email,

      telephone:
        employe.telephone ===
        "Non renseigné"
          ? ""
          : employe.telephone,

      matricule:
        employe.matricule,

      id_role:
        employe.idRole,

      role:
        employe.role,

      id_service:
        posteActuel?.id_service ||
        "",

      service:
        employe.departement,

      id_poste:
        employe.idPoste,

      poste:
        employe.poste,

      date_embauche: "",
      date_naissance: "",

      adresse:
        employe.adresse,

      ville:
        employe.ville,

      id_responsable:
        employe.idResponsable || "",

      mot_de_passe: "",
    });

    setModal(
      "modifier"
    );

    fermerMenu();
  };

  const ouvrirDetails = (
    employe
  ) => {
    setEmployeSelectionne(
      employe
    );

    setModal("details");

    fermerMenu();
  };

  const ouvrirSuppression = (
    employe
  ) => {
    setEmployeSelectionne(
      employe
    );

    setModal(
      "suppression"
    );

    fermerMenu();
  };

  const fermerModal = () => {
    if (enregistrement) {
      return;
    }

    setModal(null);

    setEmployeSelectionne(
      null
    );
  };

  const gererChangement = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormulaire(
      (ancien) => ({
        ...ancien,
        [name]: value,
      })
    );
  };

  const changerRole = (
    event
  ) => {
    const idRole =
      Number(
        event.target.value
      );

    const roleSelectionne =
      rolesAPI.find(
        (element) =>
          Number(
            element?.id_role
          ) === idRole
      );

    setFormulaire(
      (ancien) => ({
        ...ancien,

        id_role:
          idRole || "",

        role:
          roleSelectionne?.nom ||
          roleSelectionne?.libelle ||
          "Employé",
      })
    );
  };

  const changerService = (
    event
  ) => {
    const idService =
      Number(
        event.target.value
      );

    const serviceSelectionne =
      services.find(
        (element) =>
          Number(
            element?.id_service
          ) === idService
      );

    setFormulaire(
      (ancien) => ({
        ...ancien,

        id_service:
          idService || "",

        service:
          serviceSelectionne?.nom ||
          serviceSelectionne?.libelle ||
          "",

        id_poste: "",
        poste: "",
      })
    );
  };

  const changerPoste = (
    event
  ) => {
    const idPoste =
      Number(
        event.target.value
      );

    const posteSelectionne =
      postes.find(
        (element) =>
          Number(
            element?.id_poste
          ) === idPoste
      );

    setFormulaire(
      (ancien) => ({
        ...ancien,

        id_poste:
          idPoste || "",

        poste:
          posteSelectionne?.libelle ||
          posteSelectionne?.nom ||
          "",
      })
    );
  };

  const postesDisponibles =
    useMemo(() => {
      if (
        !formulaire.id_service
      ) {
        return postes;
      }

      return postes.filter(
        (poste) =>
          Number(
            poste?.id_service
          ) ===
          Number(
            formulaire.id_service
          )
      );
    }, [
      postes,
      formulaire.id_service,
    ]);

  /* ============================================================
     CRÉATION PAR INVITATION
  ============================================================ */

  const validerInvitation =
    async (event) => {
      event.preventDefault();

      if (
        !formulaire.prenom.trim() ||
        !formulaire.nom.trim() ||
        !formulaire.email.trim()
      ) {
        afficherToast(
          "Le prénom, le nom et l'e-mail sont obligatoires.",
          "error"
        );

        return;
      }

      if (
        !formulaire.matricule.trim()
      ) {
        afficherToast(
          "Le matricule est obligatoire.",
          "error"
        );

        return;
      }

      if (
        !formulaire.telephone.trim()
      ) {
        afficherToast(
          "Le numéro WhatsApp est obligatoire pour envoyer l'invitation.",
          "error"
        );

        return;
      }

      if (
        !normaliserNumeroWhatsApp(
          formulaire.telephone
        )
      ) {
        afficherToast(
          "Le numéro WhatsApp est invalide.",
          "error"
        );

        return;
      }

      if (
        !formulaire.id_role
      ) {
        afficherToast(
          "Veuillez sélectionner un rôle.",
          "error"
        );

        return;
      }

      if (
        !formulaire.id_poste
      ) {
        afficherToast(
          "Veuillez sélectionner un poste.",
          "error"
        );

        return;
      }

      try {
        setEnregistrement(
          true
        );

        const resultat =
          await api(
            "/invitations",
            {
              method: "POST",

              body:
                JSON.stringify({
                  nom:
                    formulaire.nom.trim(),

                  prenom:
                    formulaire.prenom.trim(),

                  email:
                    formulaire.email
                      .trim()
                      .toLowerCase(),

                  telephone:
                    formulaire.telephone.trim(),

                  id_role:
                    Number(
                      formulaire.id_role
                    ),

                  id_poste:
                    Number(
                      formulaire.id_poste
                    ),

                  matricule:
                    formulaire.matricule.trim(),

                  date_embauche:
                    formulaire.date_embauche ||
                    null,

                  date_naissance:
                    formulaire.date_naissance ||
                    null,

                  adresse:
                    formulaire.adresse ||
                    null,

                  ville:
                    formulaire.ville ||
                    null,

                  id_responsable:
                    formulaire.id_responsable
                      ? Number(
                          formulaire.id_responsable
                        )
                      : null,
                }),
            }
          );

        const activationUrl =
          resultat?.data
            ?.activation_url ||
          resultat?.activation_url ||
          "";

        if (activationUrl) {
          try {
            await navigator.clipboard.writeText(
              activationUrl
            );
          } catch {
            // Le lien reste disponible dans la réponse backend.
          }

          /*
           * Affichage du QR code individuel.
           * Il expire après 15 minutes (décision serveur).
           * L'envoi WhatsApp reste possible depuis le modal.
           */
          setQr({
            url: activationUrl,
            expiresAt:
              resultat?.data?.expires_at || null,
            employe: {
              id: resultat?.data?.id_employe,
              prenom:
                formulaire.prenom.trim(),

              nom:
                `${formulaire.prenom.trim()} ${formulaire.nom.trim()}`,

              telephone:
                formulaire.telephone.trim(),
            },
          });

          afficherToast(
            "Employé créé. Faites scanner le QR code par l'employé.",
            "success"
          );
        } else {
          afficherToast(
            "Employé créé, mais aucun lien d'activation n'a été retourné.",
            "error"
          );
        }

        fermerModal();

        await chargerDonnees();
      } catch (error) {
        afficherToast(
          error.message ||
            "Impossible de créer l'employé.",
          "error"
        );
      } finally {
        setEnregistrement(
          false
        );
      }
    };

  /* ============================================================
     MODIFICATION
  ============================================================ */

  const enregistrerModification =
    async (event) => {
      event.preventDefault();

      if (
        !employeSelectionne
      ) {
        return;
      }

      try {
        setEnregistrement(
          true
        );

        const donnees = {
          nom:
            formulaire.nom.trim(),

          prenom:
            formulaire.prenom.trim(),

          email:
            formulaire.email.trim(),

          telephone:
            formulaire.telephone ||
            null,

          matricule:
            formulaire.matricule.trim(),

          id_role:
            Number(
              formulaire.id_role
            ),

          id_poste:
            Number(
              formulaire.id_poste
            ),

          adresse:
            formulaire.adresse ||
            null,

          ville:
            formulaire.ville ||
            null,

          id_responsable:
            formulaire.id_responsable
              ? Number(
                  formulaire.id_responsable
                )
              : null,
        };

        if (
          formulaire.mot_de_passe
        ) {
          donnees.mot_de_passe =
            formulaire.mot_de_passe;
        }

        await api(
          `/employes/${employeSelectionne.id}`,
          {
            method: "PUT",

            body:
              JSON.stringify(
                donnees
              ),
          }
        );

        fermerModal();

        afficherToast(
          "Employé modifié avec succès."
        );

        await chargerDonnees();
      } catch (error) {
        afficherToast(
          error.message ||
            "Impossible de modifier l'employé.",
          "error"
        );
      } finally {
        setEnregistrement(
          false
        );
      }
    };

  /* ============================================================
     STATUT
  ============================================================ */

  const changerStatut =
    async (employe) => {
      try {
        setEnregistrement(
          true
        );

        const nouveauStatut =
          employe.statut ===
          "Actif"
            ? "inactif"
            : "actif";

        await api(
          `/employes/${employe.id}`,
          {
            method: "PUT",

            body:
              JSON.stringify({
                statut:
                  nouveauStatut,
              }),
          }
        );

        fermerMenu();

        afficherToast(
          employe.statut ===
          "Actif"
            ? "Employé désactivé."
            : "Employé activé."
        );

        await chargerDonnees();
      } catch (error) {
        afficherToast(
          error.message ||
            "Impossible de modifier le statut.",
          "error"
        );
      } finally {
        setEnregistrement(
          false
        );
      }
    };

  /* ============================================================
     SUPPRESSION / DÉSACTIVATION
  ============================================================ */

  const confirmerSuppression =
    async () => {
      if (
        !employeSelectionne
      ) {
        return;
      }

      try {
        setEnregistrement(
          true
        );

        await api(
          `/employes/${employeSelectionne.id}`,
          {
            method: "DELETE",
          }
        );

        fermerModal();

        afficherToast(
          "Employé désactivé avec succès."
        );

        await chargerDonnees();
      } catch (error) {
        afficherToast(
          error.message ||
            "Impossible de désactiver l'employé.",
          "error"
        );
      } finally {
        setEnregistrement(
          false
        );
      }
    };

  /* ============================================================
     COPIER EMAIL
  ============================================================ */

  const copierEmail =
    async (email) => {
      try {
        await navigator.clipboard.writeText(
          email
        );

        afficherToast(
          "Adresse e-mail copiée."
        );
      } catch {
        afficherToast(
          "Impossible de copier l'adresse.",
          "error"
        );
      }
    };

  /* ============================================================
     RENVOI INVITATION
  ============================================================ */
    

const renvoyerInvitation = async (employe) => {
  fermerMenu();

  try {
    const resultat = await api(
      `/invitations/${employe.id}/renvoyer`,
      { method: "POST" }
    );

    const activationUrl =
      resultat?.data?.activation_url ||
      resultat?.activation_url ||
      "";

    if (!activationUrl) {
      throw new Error(
        "Le serveur n'a pas retourné le lien d'activation."
      );
    }

    try {
      await navigator.clipboard.writeText(activationUrl);
    } catch {
      // La copie peut être refusée par le navigateur.
    }

    /*
     * Nouveau QR code (régénération après expiration
     * ou perte du précédent). L'envoi WhatsApp reste
     * disponible depuis le modal.
     */
    setQr({
      url: activationUrl,
      expiresAt:
        resultat?.data?.expires_at || null,
      employe: {
        id: employe.id,
        prenom:
          employe?.prenom ||
          employe?.nom?.split(" ")[0] ||
          "Bonjour",
        nom: employe?.nom || "",
        telephone: employe?.telephone || "",
      },
    });

    afficherToast(
      "Nouveau QR code généré. Le précédent n'est plus valable.",
      "success"
    );
  } catch (error) {
    afficherToast(
      error.message || "Impossible de renvoyer l'invitation.",
      "error"
    );
  }
};

  /* ============================================================
     RESET FILTRES
  ============================================================ */

  const reinitialiserFiltres =
    () => {
      setRecherche("");

      setDepartement(
        "Tous les départements"
      );

      setRole(
        "Tous les rôles"
      );

      setStatut(
        "Tous les statuts"
      );

      setPage(1);
    };

  /* ============================================================
     MENU FLOTTANT
  ============================================================ */

  const menuEmploye =
    menuOuvert !== null
      ? employes.find(
          (element) =>
            element.id ===
            menuOuvert
        )
      : null;

  const menuFlottant =
    menuEmploye &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            className="employee-floating-menu"
            style={{
              top:
                menuPosition.top,
              left:
                menuPosition.left,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                ouvrirDetails(
                  menuEmploye
                )
              }
            >
              <Eye size={16} />

              {t("Voir le profil")}
            </button>

            {peutModifierEmploye && (
              <button
                type="button"
                onClick={() =>
                  ouvrirModification(
                    menuEmploye
                  )
                }
              >
                <Pencil size={16} />

                {t("Modifier")}
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                copierEmail(
                  menuEmploye.email
                )
              }
            >
              <Copy size={16} />

              {t("Copier l'e-mail")}
            </button>

            {peutModifierEmploye && (
              <button
                type="button"
                onClick={() =>
                  changerStatut(
                    menuEmploye
                  )
                }
              >
                {menuEmploye.statut ===
                "Actif" ? (
                  <>
                    <XCircle size={16} />

                    {t("Désactiver")}
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={16}
                    />

                    {t("Activer")}
                  </>
                )}
              </button>
            )}

            {menuEmploye.invitation ===
              "Invitation en attente" && (
              <button
                type="button"
                onClick={() =>
                  renvoyerInvitation(
                    menuEmploye
                  )
                }
              >
                <Send size={16} />

                {t("Renvoyer l'invitation")}
              </button>
            )}

            {peutSupprimerEmploye && (
              <button
                type="button"
                className="danger"
                onClick={() =>
                  ouvrirSuppression(
                    menuEmploye
                  )
                }
              >
                <Trash2 size={16} />

                {t("Désactiver")}
              </button>
            )}
          </div>,
          document.body
        )
      : null;

  /* ============================================================
     RENDU
  ============================================================ */

  if (!peutVoirEmployes) {
    return (
      <div className="employees-page">
        <div className="employee-error">
          <AlertCircle size={20} />

          <span>
            {t("Vous n'avez pas l'autorisation d'accéder à la gestion des employés.")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="employees-page"
      onClick={fermerMenu}
    >
      {/* ========================================================
          EN-TÊTE
      ======================================================== */}

      <div className="employees-header">
        <div>
          <div className="employees-title-line">
            <Users size={27} />

            <div>
              <h1>
                {t("Gestion des employés")}
              </h1>

              <p>
                {t("Gérez les collaborateurs, leurs accès et leurs informations.")}
              </p>
            </div>
          </div>
        </div>

        {peutCreerEmploye && (
          <button
            type="button"
            className="employees-primary-button"
            onClick={(event) => {
              event.stopPropagation();
              ouvrirInvitation();
            }}
          >
            <UserPlus size={18} />

            {t("Inviter un employé")}
          </button>
        )}
      </div>

      {/* ========================================================
          STATISTIQUES
      ======================================================== */}

      <div className="employees-stats">

        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>
              {t("Total employés")}
            </span>

            <strong>
              {totalEmployes}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon success">
            <UserCheck size={21} />
          </div>

          <div>
            <span>
              {t("Employés actifs")}
            </span>

            <strong>
              {employesActifs}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon warning">
            <Clock3 size={21} />
          </div>

          <div>
            <span>
              {t("Invitations en attente")}
            </span>

            <strong>
              {invitationsEnAttente}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>
              {t("Responsables")}
            </span>

            <strong>
              {responsables}
            </strong>
          </div>
        </div>

      </div>

      {/* ========================================================
          FILTRES
      ======================================================== */}

      <div className="employees-filters">

        <div className="employee-search">
          <Search size={18} />

          <input
            type="text"
            placeholder={t("Rechercher un employé...")}
            value={recherche}
            onChange={(event) => {
              setRecherche(
                event.target.value
              );

              setPage(1);
            }}
          />
        </div>

        <div className="employee-filter">
          <Filter size={17} />

          <select
            value={departement}
            onChange={(event) => {
              setDepartement(
                event.target.value
              );

              setPage(1);
            }}
          >
            {departements.map(
              (element) => (
                <option
                  key={element}
                  value={element}
                >
                  {element}
                </option>
              )
            )}
          </select>
        </div>

        <div className="employee-filter">
          <ShieldCheck size={17} />

          <select
            value={role}
            onChange={(event) => {
              setRole(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="Tous les rôles">
              {t("Tous les rôles")}
            </option>

            {roles.map(
              (element) => (
                <option
                  key={element}
                  value={element}
                >
                  {element}
                </option>
              )
            )}
          </select>
        </div>

        <div className="employee-filter">
          <CheckCircle2 size={17} />

          <select
            value={statut}
            onChange={(event) => {
              setStatut(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="Tous les statuts">
              {t("Tous les statuts")}
            </option>

            <option value="Actif">
              {t("Actif")}
            </option>

            <option value="Inactif">
              {t("Inactif")}
            </option>
          </select>
        </div>

        <button
          type="button"
          className="employee-reset-button"
          onClick={
            reinitialiserFiltres
          }
        >
          <RefreshCw size={16} />

          {t("Réinitialiser")}
        </button>

      </div>

      {/* ========================================================
          ERREUR
      ======================================================== */}

      {erreur && (
        <div className="employee-error">

          <AlertCircle size={18} />

          <span>
            {t(erreur)}
          </span>

          <button
            type="button"
            onClick={
              chargerDonnees
            }
          >
            {t("Réessayer")}
          </button>

        </div>
      )}

      {/* ========================================================
          TABLEAU
      ======================================================== */}

      <div className="employees-table-card">

        <div className="employees-table-header">

          <div>
            <h2>
              {t("Collaborateurs")}
            </h2>

            <p>
              {employesFiltres.length}{" "}
              {t("résultat(s)")}
            </p>
          </div>

        </div>

        {chargement ? (
          <div className="employees-loading">

            <LoaderCircle
              size={30}
              className="spin"
            />

            <span>
              {t("Chargement des employés...")}
            </span>

          </div>
        ) : employesAffiches.length ===
          0 ? (

          <div className="employees-empty">

            <Users size={38} />

            <h3>
              {t("Aucun employé trouvé")}
            </h3>

            <p>
              {t("Modifiez vos filtres ou ajoutez un collaborateur.")}
            </p>

          </div>

        ) : (

          <div className="employees-table-wrapper">

            <table className="employees-table">

              <thead>
                <tr>
                  <th>
                    {t("Employé")}
                  </th>

                  <th>
                    {t("Poste")}
                  </th>

                  <th>
                    {t("Service")}
                  </th>

                  <th>
                    {t("Rôle")}
                  </th>

                  <th>
                    {t("Statut")}
                  </th>

                  <th>
                    {t("Arrivée")}
                  </th>

                  <th>
                    {t("Actions")}
                  </th>
                </tr>
              </thead>

              <tbody>

                {employesAffiches.map(
                  (employe) => (
                    <tr
                      key={
                        employe.id
                      }
                    >

                      <td>

                        <div className="employee-cell-main">

                          <Avatar
                            employe={
                              employe
                            }
                          />

                          <div>

                            <strong>
                              {employe.nom}
                            </strong>

                            <span>
                              {employe.email}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>

                        <div className="employee-cell-info">

                          <BriefcaseBusiness
                            size={15}
                          />

                          {
                            employe.poste
                          }

                        </div>

                      </td>

                      <td>

                        <div className="employee-cell-info">

                          <Building2
                            size={15}
                          />

                          {
                            employe.departement
                          }

                        </div>

                      </td>

                      <td>

                        <span className="employee-role-badge">

                          <ShieldCheck
                            size={14}
                          />

                          {t(employe.role)}

                        </span>

                      </td>

                      <td>

                        <span
                          className={
                            employe.statut ===
                            "Actif"
                              ? "employee-status active"
                              : "employee-status inactive"
                          }
                        >

                          {employe.statut ===
                          "Actif" ? (
                            <CheckCircle2
                              size={14}
                            />
                          ) : (
                            <XCircle
                              size={14}
                            />
                          )}

                          {t(employe.statut)}

                        </span>

                      </td>

                      <td>
                        {
                          employe.dateArrivee
                        }
                      </td>

                      <td>

                        <div
                          className="employee-actions"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >

                          <button
                            type="button"
                            className="employee-action-view"
                            title={t("Voir")}
                            onClick={() =>
                              ouvrirDetails(
                                employe
                              )
                            }
                          >
                            <Eye size={17} />
                          </button>

                          {peutModifierEmploye && (
                            <button
                              type="button"
                              className="employee-action-edit"
                              title={t("Modifier")}
                              onClick={() =>
                                ouvrirModification(
                                  employe
                                )
                              }
                            >
                              <Pencil
                                size={17}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            className="employee-action-more employee-more-trigger"
                            title={t("Plus")}
                            onClick={(event) =>
                              ouvrirMenu(
                                event,
                                employe.id
                              )
                            }
                          >
                            <MoreVertical
                              size={18}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* ======================================================
            PAGINATION
        ====================================================== */}

        {!chargement &&
          employesFiltres.length >
            0 && (

          <div className="employees-pagination">

            <span>

              {t("Affichage de")}{" "}

              <strong>
                {(pageActuelle - 1) *
                  elementsParPage +
                  1}
              </strong>{" "}

              {t("à")}{" "}

              <strong>
                {Math.min(
                  pageActuelle *
                    elementsParPage,
                  employesFiltres.length
                )}
              </strong>{" "}

              {t("sur")}{" "}

              <strong>
                {employesFiltres.length}
              </strong>

            </span>

            <div>

              <button
                type="button"
                disabled={
                  pageActuelle <= 1
                }
                onClick={() =>
                  setPage(
                    (ancienne) =>
                      Math.max(
                        1,
                        ancienne - 1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <span>
                {t("Page")}{" "}
                {pageActuelle} /{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  pageActuelle >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (ancienne) =>
                      Math.min(
                        totalPages,
                        ancienne + 1
                      )
                  )
                }
              >
                <ChevronRight
                  size={17}
                />
              </button>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================
          MODAL INVITATION / MODIFICATION
      ======================================================== */}

      {(modal === "invitation" ||
        modal === "modifier") && (

        <div
          className="employee-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fermerModal();
            }
          }}
        >

          <div className="employee-modal employee-form-modal">

            <div className="employee-modal-header">

              <div>

                <h2>
                  {modal ===
                  "invitation"
                    ? t("Inviter un employé")
                    : t("Modifier l'employé")}
                </h2>

                <p>
                  {modal ===
                  "invitation"
                    ? t("Créez le compte professionnel du collaborateur.")
                    : t("Mettez à jour les informations du collaborateur.")}
                </p>

              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={
                  fermerModal
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                modal ===
                "invitation"
                  ? validerInvitation
                  : enregistrerModification
              }
            >

              <div className="employee-form-grid">

                <label className="form-field">

                  <span>
                    {t("Prénom *")}
                  </span>

                  <input
                    name="prenom"
                    value={
                      formulaire.prenom
                    }
                    onChange={
                      gererChangement
                    }
                    required
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Nom *")}
                  </span>

                  <input
                    name="nom"
                    value={
                      formulaire.nom
                    }
                    onChange={
                      gererChangement
                    }
                    required
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("E-mail *")}
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      formulaire.email
                    }
                    onChange={
                      gererChangement
                    }
                    required
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Téléphone / WhatsApp")}
                  </span>

                  <input
                    name="telephone"
                    value={
                      formulaire.telephone
                    }
                    onChange={
                      gererChangement
                    }
                    placeholder={t("07 00 00 00 00")}
                    required={
                      modal ===
                      "invitation"
                    }
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Matricule *")}
                  </span>

                  <input
                    name="matricule"
                    value={
                      formulaire.matricule
                    }
                    onChange={
                      gererChangement
                    }
                    required
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Rôle *")}
                  </span>

                  <select
                    value={
                      formulaire.id_role
                    }
                    onChange={
                      changerRole
                    }
                    required
                  >

                    <option value="">
                      {t("Sélectionner un rôle")}
                    </option>

                    {rolesAPI.map(
                      (element) => (
                        <option
                          key={
                            element.id_role
                          }
                          value={
                            element.id_role
                          }
                        >
                          {roleTexte(
                            element.nom ||
                              element.libelle
                          )}
                        </option>
                      )
                    )}

                  </select>

                </label>

                <label className="form-field">

                  <span>
                    {t("Service")}
                  </span>

                  <select
                    value={
                      formulaire.id_service
                    }
                    onChange={
                      changerService
                    }
                  >

                    <option value="">
                      {t("Sélectionner")}
                    </option>

                    {services.map(
                      (element) => (
                        <option
                          key={
                            element.id_service
                          }
                          value={
                            element.id_service
                          }
                        >
                          {element.nom ||
                            element.libelle}
                        </option>
                      )
                    )}

                  </select>

                </label>

                <label className="form-field">

                  <span>
                    {t("Poste *")}
                  </span>

                  <select
                    value={
                      formulaire.id_poste
                    }
                    onChange={
                      changerPoste
                    }
                    required
                  >

                    <option value="">
                      {t("Sélectionner")}
                    </option>

                    {postesDisponibles.map(
                      (element) => (
                        <option
                          key={
                            element.id_poste
                          }
                          value={
                            element.id_poste
                          }
                        >
                          {element.libelle ||
                            element.nom}
                        </option>
                      )
                    )}

                  </select>

                </label>

                <label className="form-field">

                  <span>
                    {t("Supérieur hiérarchique")}
                  </span>

                  <select
                    value={
                      formulaire.id_responsable
                    }
                    onChange={(event) =>
                      setFormulaire({
                        ...formulaire,
                        id_responsable:
                          event.target.value,
                      })
                    }
                  >

                    <option value="">
                      {t("Aucun (à définir plus tard)")}
                    </option>

                    {employes
                      .filter(
                        (candidat) =>
                          candidat.statut ===
                            "Actif" &&
                          candidat.idUtilisateur &&
                          candidat.idUtilisateur !==
                            employeSelectionne?.idUtilisateur
                      )
                      .map((candidat) => (
                        <option
                          key={
                            candidat.idUtilisateur
                          }
                          value={
                            candidat.idUtilisateur
                          }
                        >
                          {candidat.nom} —{" "}
                          {t(candidat.role)}
                        </option>
                      ))}

                  </select>

                </label>

                <label className="form-field">

                  <span>
                    {t("Date d'embauche")}
                  </span>

                  <input
                    type="date"
                    name="date_embauche"
                    value={
                      formulaire.date_embauche
                    }
                    onChange={
                      gererChangement
                    }
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Date de naissance")}
                  </span>

                  <input
                    type="date"
                    name="date_naissance"
                    value={
                      formulaire.date_naissance
                    }
                    onChange={
                      gererChangement
                    }
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Ville")}
                  </span>

                  <input
                    name="ville"
                    value={
                      formulaire.ville
                    }
                    onChange={
                      gererChangement
                    }
                  />

                </label>

                <label className="form-field">

                  <span>
                    {t("Adresse")}
                  </span>

                  <input
                    name="adresse"
                    value={
                      formulaire.adresse
                    }
                    onChange={
                      gererChangement
                    }
                  />

                </label>

                {modal ===
                  "modifier" && (

                  <label className="form-field">

                    <span>
                      {t("Nouveau mot de passe")}
                    </span>

                    <input
                      type="password"
                      name="mot_de_passe"
                      value={
                        formulaire.mot_de_passe
                      }
                      onChange={
                        gererChangement
                      }
                      placeholder={t("Laisser vide pour conserver")}
                    />

                  </label>

                )}

              </div>

              {modal ===
                "invitation" && (

                <div className="employee-invitation-info">

                  <Send size={17} />

                  <span>
                    {t("Après la création du compte, le lien d'activation sera généré et WhatsApp s'ouvrira avec un message prêt à être envoyé au numéro renseigné.")}
                  </span>

                </div>

              )}

              <div className="employee-modal-footer">

                <button
                  type="button"
                  className="employee-secondary-button"
                  onClick={
                    fermerModal
                  }
                  disabled={
                    enregistrement
                  }
                >
                  {t("Annuler")}
                </button>

                <button
                  type="submit"
                  className="employees-primary-button"
                  disabled={
                    enregistrement
                  }
                >

                  {enregistrement ? (
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {modal ===
                  "invitation"
                    ? t("Créer l'employé")
                    : t("Enregistrer")}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================
          MODAL PROFIL
      ======================================================== */}

      {modal === "details" &&
        employeSelectionne && (

        <div
          className="employee-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fermerModal();
            }
          }}
        >

          <div className="employee-modal">

            <div className="employee-modal-header">

              <div>

                <h2>
                  {t("Profil employé")}
                </h2>

                <p>
                  {t("Informations du collaborateur.")}
                </p>

              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={
                  fermerModal
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="employee-profile">

              <Avatar
                employe={
                  employeSelectionne
                }
                large
              />

              <h2>
                {
                  employeSelectionne.nom
                }
              </h2>

              <span>
                {
                  employeSelectionne.poste
                }
              </span>

              <div className="profile-role">

                <ShieldCheck
                  size={15}
                />

                {
                  employeSelectionne.role
                }

              </div>

              <div className="profile-info-grid">

                <div>

                  <Mail size={17} />

                  <span>
                    {t("E-mail")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.email
                    }
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      copierEmail(
                        employeSelectionne.email
                      )
                    }
                  >
                    <Copy size={13} />

                    {t("Copier")}
                  </button>

                </div>

                <div>

                  <Phone size={17} />

                  <span>
                    {t("Téléphone")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.telephone
                    }
                  </strong>

                </div>

                <div>

                  <Building2
                    size={17}
                  />

                  <span>
                    {t("Service")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.departement
                    }
                  </strong>

                </div>

                <div>

                  <BriefcaseBusiness
                    size={17}
                  />

                  <span>
                    {t("Poste")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.poste
                    }
                  </strong>

                </div>

                <div>

                  <ShieldCheck
                    size={17}
                  />

                  <span>
                    {t("Matricule")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.matricule ||
                      "Non renseigné"
                    }
                  </strong>

                </div>

                <div>

                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    {t("Statut")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.statut
                    }
                  </strong>

                </div>

                <div>

                  <Clock3 size={17} />

                  <span>
                    {t("Date d'arrivée")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.dateArrivee
                    }
                  </strong>

                </div>

                <div>

                  <Building2
                    size={17}
                  />

                  <span>
                    {t("Ville")}
                  </span>

                  <strong>
                    {
                      employeSelectionne.ville ||
                      "Non renseignée"
                    }
                  </strong>

                </div>

              </div>

            </div>

            <div className="employee-modal-footer">

              <button
                type="button"
                className="employee-secondary-button"
                onClick={
                  fermerModal
                }
              >
                {t("Fermer")}
              </button>

              {peutModifierEmploye && (

                <button
                  type="button"
                  className="employees-primary-button"
                  onClick={() =>
                    ouvrirModification(
                      employeSelectionne
                    )
                  }
                >
                  <Pencil size={16} />

                  {t("Modifier")}
                </button>

              )}

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          MODAL DÉSACTIVATION
      ======================================================== */}

      {modal === "suppression" &&
        employeSelectionne && (

        <div
          className="employee-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fermerModal();
            }
          }}
        >

          <div className="employee-modal employee-delete-modal">

            <div className="delete-icon">
              <Trash2 size={25} />
            </div>

            <h2>
              {t("Désactiver l'employé ?")}
            </h2>

            <p>
              {t("Le compte de")}{" "}
              <strong>
                {
                  employeSelectionne.nom
                }
              </strong>{" "}
              {t("sera désactivé.")}
            </p>

            <div className="employee-modal-footer">

              <button
                type="button"
                className="employee-secondary-button"
                onClick={
                  fermerModal
                }
                disabled={
                  enregistrement
                }
              >
                {t("Annuler")}
              </button>

              <button
                type="button"
                className="danger"
                onClick={
                  confirmerSuppression
                }
                disabled={
                  enregistrement
                }
              >

                {enregistrement ? (
                  <LoaderCircle
                    size={17}
                    className="spin"
                  />
                ) : (
                  <Trash2 size={17} />
                )}

                {t("Désactiver")}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          MODAL QR CODE D'INSCRIPTION
      ======================================================== */}

      {qr && createPortal(
        <div
          className="employee-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setQr(null);
            }
          }}
        >
          <div className="employee-modal qr-modal">

            <div className="qr-modal-header">

              <div className="qr-modal-title">
                <QrCode size={22} />
                <h2>{t("QR code d'inscription")}</h2>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={() => setQr(null)}
              >
                <X size={19} />
              </button>

            </div>

            <p className="qr-modal-employe">
              {qr.employe?.prenom}{" "}
              {qr.employe?.nom}
            </p>

            {/* Compte à rebours */}
            <div
              className={
                qrExpire
                  ? "qr-countdown qr-countdown-expire"
                  : "qr-countdown"
              }
            >
              {qrExpire ? (
                <>
                  <AlertCircle size={17} />
                  <span>
                    {t("QR code expiré — demandez un nouveau via « Renvoyer l'invitation ».")}
                  </span>
                </>
              ) : (
                <>
                  <Clock3 size={17} />
                  <span>
                    {t("Expire dans")}{" "}
                    <strong>{qrMinuteur}</strong>
                  </span>
                </>
              )}
            </div>

            {/* QR code */}
            <div className="qr-code-box">
              <QRCodeSVG
                value={qrUrlAccessible}
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="qr-modal-aide">
              {t("L'employé scanne ce code avec son téléphone, complète ses informations personnelles et choisit son mot de passe. Le QR code est utilisable une seule fois.")}
            </p>

            <div className="employee-modal-footer">

              <button
                type="button"
                className="employee-secondary-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      qrUrlAccessible
                    );

                    afficherToast(
                      "Lien d'activation copié.",
                      "success"
                    );
                  } catch {
                    afficherToast(
                      "Impossible de copier le lien.",
                      "error"
                    );
                  }
                }}
              >
                <Copy size={16} />
                {t("Copier le lien")}
              </button>

              <button
                type="button"
                className="employee-secondary-button"
                onClick={() => {
                  ouvrirWhatsAppInvitation(
                    qr.employe,
                    qrUrlAccessible
                  );
                }}
              >
                <Send size={16} />
                {t("Envoyer par WhatsApp")}
              </button>

              <button
                type="button"
                className="employees-primary-button"
                onClick={() => setQr(null)}
              >
                {t("Fermer")}
              </button>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================
          MENU FLOTTANT
      ======================================================== */}

      {menuFlottant}

      {/* ========================================================
          TOAST
      ======================================================== */}

      {toast && (

        <div
          className={`employee-toast ${toast.type}`}
        >

          {toast.type ===
          "success" ? (
            <CheckCircle2
              size={19}
            />
          ) : (
            <AlertCircle
              size={19}
            />
          )}

          <span>
            {t(toast.message)}
          </span>

        </div>

      )}

    </div>
  );
}
