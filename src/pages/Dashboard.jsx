import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLanguage } from "../context/LanguageContext";
import { formaterDateSelonPreference } from "../context/LanguageContext";

import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CircleAlert,
  CircleCheck,
  Clock3,
  FilePlus,
  FileText,
  Plus,
  RefreshCw,
  Timer,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/pages/dashboard.css";

import { API_URL } from "../config/api";
import api from "../config/apiClient";

/* ============================================================
   VALEURS PAR DÉFAUT
============================================================ */

const EMPTY_DASHBOARD = {
  utilisateur: null,

  stats: {
    employes_actifs: 0,
    employes_total: 0,

    taches_total: 0,
    taches_en_cours: 0,
    taches_terminees: 0,
    taches_en_attente: 0,
    taches_validation: 0,
    taches_en_retard: 0,

    demandes_total: 0,
    demandes_en_attente: 0,
    demandes_acceptees: 0,
    demandes_refusees: 0,
    demandes_annulees: 0,

    taux_avancement: 0,
  },

  taches: [],
  demandes: [],
  activites: [],
  notifications: [],

  meta: {},
};

/* ============================================================
   OUTILS
============================================================ */

function obtenirToken() {
  return (
    localStorage.getItem("gain_office_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function normaliserTexte(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenirNomUtilisateur(utilisateur) {
  if (!utilisateur) {
    return "Utilisateur";
  }

  const nomComplet = [
    utilisateur.prenom,
    utilisateur.nom,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nomComplet ||
    utilisateur.nom_complet ||
    utilisateur.name ||
    "Utilisateur"
  );
}

function obtenirRole(utilisateur) {
  return (
    utilisateur?.role?.nom ||
    (typeof utilisateur?.role === "string"
      ? utilisateur.role
      : "") ||
    utilisateur?.role_nom ||
    ""
  );
}

function obtenirInitiales(value) {
  const texte = String(value || "").trim();

  if (!texte) {
    return "GO";
  }

  const morceaux = texte
    .split(/\s+/)
    .filter(Boolean);

  if (morceaux.length === 1) {
    return morceaux[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    morceaux[0][0] +
    morceaux[morceaux.length - 1][0]
  ).toUpperCase();
}

function formaterNombre(value) {
  const nombre = Number(value);

  return new Intl.NumberFormat("fr-FR").format(
    Number.isFinite(nombre) ? nombre : 0
  );
}

function formaterDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return formaterDateSelonPreference(date);
}

function formaterDateCourte(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return formaterDateSelonPreference(date);
}

function formaterHeure(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(document.documentElement.lang === "en" ? "en-GB" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   STATUTS
============================================================ */

function obtenirClasseStatut(statut) {
  const value = normaliserTexte(statut);

  if (
    [
      "terminee",
      "termine",
      "validee",
      "acceptee",
      "actif",
    ].includes(value)
  ) {
    return "dashboard-status success";
  }

  if (
    [
      "en_attente",
      "en cours",
      "en_cours",
      "a_faire",
      "a_valider",
      "en_attente_validation",
    ].includes(value)
  ) {
    return "dashboard-status warning";
  }

  if (
    [
      "refusee",
      "annulee",
      "en_retard",
    ].includes(value)
  ) {
    return "dashboard-status danger";
  }

  return "dashboard-status neutral";
}

function obtenirClassePriorite(priorite) {
  const value = normaliserTexte(priorite);

  if (
    value === "haute" ||
    value === "high"
  ) {
    return "priority high";
  }

  if (
    value === "moyenne" ||
    value === "medium"
  ) {
    return "priority medium";
  }

  return "priority low";
}

function obtenirTexteStatut(statut) {
  if (!statut) {
    return "—";
  }

  return String(statut)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   ACTIVITÉS
============================================================ */

function obtenirIconeActivite(type) {
  const value = normaliserTexte(type);

  if (
    value.includes("tache") ||
    value.includes("task")
  ) {
    return <ClipboardList size={16} />;
  }

  if (
    value.includes("demande") ||
    value.includes("request")
  ) {
    return <FileText size={16} />;
  }

  if (
    value.includes("employ") ||
    value.includes("employee")
  ) {
    return <Users size={16} />;
  }

  return <CheckCircle2 size={16} />;
}

function obtenirClasseActivite(type) {
  const value = normaliserTexte(type);

  if (
    value.includes("demande") ||
    value.includes("request")
  ) {
    return "activity request";
  }

  if (
    value.includes("employ") ||
    value.includes("employee")
  ) {
    return "activity employee";
  }

  if (
    value.includes("tache") ||
    value.includes("task")
  ) {
    return "activity task";
  }

  return "activity success";
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

function obtenirClasseNotification(type) {
  const value = normaliserTexte(type);

  if (
    value.includes("warning") ||
    value.includes("alerte") ||
    value.includes("retard")
  ) {
    return "dashboard-notification-icon warning";
  }

  if (
    value.includes("task") ||
    value.includes("tache")
  ) {
    return "dashboard-notification-icon task";
  }

  if (
    value.includes("error") ||
    value.includes("danger")
  ) {
    return "dashboard-notification-icon danger";
  }

  return "dashboard-notification-icon system";
}

function obtenirIconeNotification(type) {
  const value = normaliserTexte(type);

  if (
    value.includes("warning") ||
    value.includes("alerte") ||
    value.includes("retard")
  ) {
    return <AlertCircle size={16} />;
  }

  if (
    value.includes("task") ||
    value.includes("tache")
  ) {
    return <ClipboardList size={16} />;
  }

  if (
    value.includes("error") ||
    value.includes("danger")
  ) {
    return <XCircle size={16} />;
  }

  return <Bell size={16} />;
}

/* ============================================================
   COMPOSANT
============================================================ */

function Dashboard({ utilisateur: utilisateurProp }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const auth = useAuth();

  const utilisateur =
    auth?.utilisateur ||
    utilisateurProp ||
    null;

  const can =
    typeof auth?.can === "function"
      ? auth.can
      : () => false;

  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const roleOriginal = useMemo(
    () => obtenirRole(utilisateur),
    [utilisateur]
  );

  const role = normaliserTexte(
    roleOriginal
  );

  const nomUtilisateur =
    obtenirNomUtilisateur(utilisateur);

  const estDirecteur =
    role === "directeur";

  const estResponsable =
    role === "responsable" || role === "sous-directeur";

  const estRH =
    role === "ressources humaines" ||
    role === "rh";

  const estAdministrateur =
    role === "administrateur";
      /* ==========================================================
     PERMISSIONS
  ========================================================== */

 const peutCreerTache =
  can("taches.creer") ||
  can("creer_tache");

const peutCreerDemande =
  !estDirecteur &&
  (
    can("demandes.creer") ||
    can("creer_demande")
  );

const peutVoirEmployes =
  can("employes.voir") ||
  can("voir_employes");

const peutVoirDemandes =
  can("demandes.voir") ||
  can("voir_demandes");

const peutVoirRapports =
  can("rapports.voir") ||
  can("voir_rapports");

const peutNouvelleTache =
  peutCreerTache;

const peutNouvelleDemande =
  peutCreerDemande;

  /* ==========================================================
     CHARGEMENT DU DASHBOARD
  ========================================================== */

  const chargerDashboard = useCallback(
    async (mode = "normal") => {
      const token = obtenirToken();

      if (!token) {
        setError(
          "Votre session n'est pas disponible. Veuillez vous reconnecter."
        );

        setLoading(false);
        return;
      }

      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await api.get("/dashboard");

        const data = response.data || {};

        setDashboard({
          ...EMPTY_DASHBOARD,
          ...data,

          stats: {
            ...EMPTY_DASHBOARD.stats,
            ...(data?.stats || {}),
          },

          taches: Array.isArray(
            data?.taches
          )
            ? data.taches
            : [],

          demandes: Array.isArray(
            data?.demandes
          )
            ? data.demandes
            : [],

          activites: Array.isArray(
            data?.activites
          )
            ? data.activites
            : [],

          notifications: Array.isArray(
            data?.notifications
          )
            ? data.notifications
            : [],
        });
      } catch (err) {
        console.error(
          "GAIN OFFICE Dashboard :",
          err
        );

        const data = err?.response?.data;

        setError(
          data?.message ||
            data?.error ||
            err?.message ||
            "Impossible de charger le tableau de bord."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    chargerDashboard();
  }, [chargerDashboard]);

  /* Actualisation automatique */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        chargerDashboard("refresh");
      }, 60000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [chargerDashboard]);

  /* ==========================================================
     DONNÉES
  ========================================================== */

  const stats =
    dashboard.stats || {};

  const taches =
    dashboard.taches || [];

  const demandes =
    dashboard.demandes || [];

  const activites =
    dashboard.activites || [];

  const notifications =
    dashboard.notifications || [];

  /* ==========================================================
     STATISTIQUES SÉCURISÉES
  ========================================================== */

  const employesActifs =
    Number(stats.employes_actifs) || 0;

  const employesTotal =
    Number(stats.employes_total) || 0;

  const tachesTotal =
    Number(stats.taches_total) || 0;

  const tachesEnCours =
    Number(stats.taches_en_cours) || 0;

  const tachesTerminees =
    Number(stats.taches_terminees) || 0;

  const tachesEnRetard =
    Number(stats.taches_en_retard) || 0;

  const tachesValidation =
    Number(
      stats.taches_validation ??
      stats.taches_en_attente
    ) || 0;

  const demandesTotal =
    Number(stats.demandes_total) || 0;

  const demandesEnAttente =
    Number(stats.demandes_en_attente) || 0;

  const demandesAcceptees =
    Number(stats.demandes_acceptees) || 0;

  const demandesRefusees =
    Number(stats.demandes_refusees) || 0;

  const tauxAvancement = Math.min(
    100,
    Math.max(
      0,
      Number(stats.taux_avancement) ||
        (tachesTotal > 0
          ? Math.round(
              (tachesTerminees /
                tachesTotal) *
                100
            )
          : 0)
    )
  );

  const tauxDemandes =
    demandesTotal > 0
      ? Math.round(
          (demandesAcceptees /
            demandesTotal) *
            100
        )
      : 0;

  const tachesRecentes =
    useMemo(
      () => taches.slice(0, 6),
      [taches]
    );

  const demandesRecentes =
    useMemo(
      () => demandes.slice(0, 5),
      [demandes]
    );

  const activitesRecentes =
    useMemo(
      () => activites.slice(0, 5),
      [activites]
    );

  const notificationsRecentes =
    useMemo(
      () => notifications.slice(0, 5),
      [notifications]
    );

  const notificationNonLues =
    notifications.filter(
      (notification) =>
        !notification.lu
    ).length;

  const titreAccueil = useMemo(() => {
    if (estDirecteur) {
      return "Vue générale de l'entreprise";
    }

    if (estRH) {
      return "Vue générale des ressources humaines";
    }

    if (estResponsable) {
      return "Vue générale de votre équipe";
    }

    if (estAdministrateur) {
      return "Administration de GAIN OFFICE";
    }

    return "Votre espace de travail";
  }, [
    estDirecteur,
    estRH,
    estResponsable,
    estAdministrateur,
  ]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const allerEmployes =
    useCallback(() => {
      navigate("/employes");
    }, [navigate]);

  const allerTaches =
    useCallback(() => {
      navigate("/taches");
    }, [navigate]);

  const allerNouvelleTache =
  useCallback(() => {
    navigate("/taches");
  }, [navigate]);

  const allerDemandes =
    useCallback(() => {
      navigate("/demandes");
    }, [navigate]);

  const allerNouvelleDemande =
    useCallback(() => {
      navigate("/demandes?nouvelle=1");
    }, [navigate]);

  const allerNotifications =
    useCallback(() => {
      navigate("/notifications");
    }, [navigate]);

  const allerRapports =
    useCallback(() => {
      navigate("/rapports");
    }, [navigate]);

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-loading">
          <div className="dashboard-loading-spinner">
            <RefreshCw size={26} />
          </div>

          <strong>
            {t("Chargement du tableau de bord...")}
          </strong>

          <span>
            {t("Récupération des données GAIN OFFICE")}
          </span>
        </section>
      </div>
    );
  }

  /* ==========================================================
     ERREUR
  ========================================================== */

  if (error && !dashboard.utilisateur) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-error">
          <div className="dashboard-error-icon">
            <CircleAlert size={28} />
          </div>

          <div>
            <strong>
              {t("Impossible de charger le dashboard")}
            </strong>

            <p>{error}</p>

            <button
              type="button"
              className="dashboard-action-primary"
              onClick={() =>
                chargerDashboard("refresh")
              }
            >
              <RefreshCw size={16} />
              {t("Réessayer")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* =====================================================
          ACCUEIL
      ====================================================== */}

      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            {t("GAIN OFFICE")}
          </span>

          <h1>
            {t("Bonjour,")} {nomUtilisateur} 👋
          </h1>

          <p>{t(titreAccueil)}</p>

          <div className="dashboard-user-context">
            <span>
              {t(roleOriginal || "Utilisateur")}
            </span>
          </div>
        </div>

        <div className="dashboard-welcome-right">
          <div className="dashboard-date">
            <CalendarDays size={17} />

            <span>
              {formaterDateSelonPreference(new Date())}
            </span>
          </div>

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={() =>
              chargerDashboard("refresh")
            }
            disabled={refreshing}
            title={t("Actualiser")}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "dashboard-spin"
                  : ""
              }
            />
          </button>
        </div>
      </section>

      {/* =====================================================
          ERREUR NON BLOQUANTE
      ====================================================== */}

      {error && (
        <div className="dashboard-inline-error">
          <CircleAlert size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              chargerDashboard("refresh")
            }
          >
            {t("Réessayer")}
          </button>
        </div>
      )}

      {/* =====================================================
          ACTIONS RAPIDES
      ====================================================== */}

      <section className="dashboard-actions">
        {peutNouvelleTache && (
          <button
            type="button"
            className="dashboard-action-primary"
            onClick={allerNouvelleTache}
          >
            <Plus size={17} />
            {t("Nouvelle tâche")}
          </button>
        )}

        {peutNouvelleDemande && (
          <button
            type="button"
            className="dashboard-action-secondary dashboard-action-request"
            onClick={allerNouvelleDemande}
          >
            <FilePlus size={17} />
            {t("Nouvelle demande")}
          </button>
        )}

        {peutVoirEmployes && (
          <button
            type="button"
            className="dashboard-action-secondary"
            onClick={allerEmployes}
          >
            <UserPlus size={17} />
            {t("Gérer les employés")}
          </button>
        )}

        {peutVoirDemandes && (
          <button
            type="button"
            className="dashboard-action-secondary"
            onClick={allerDemandes}
          >
            <FileText size={17} />
            {t("Voir les demandes")}
          </button>
        )}

        {peutVoirRapports && (
          <button
            type="button"
            className="dashboard-action-secondary"
            onClick={allerRapports}
          >
            <ClipboardList size={17} />
            {t("Rapports")}
          </button>
        )}
      </section>

      {/* =====================================================
          STATISTIQUES PRINCIPALES
      ====================================================== */}

      <section className="dashboard-stats">

        {/* EMPLOYÉS */}

        {(estDirecteur ||
          estRH ||
          estAdministrateur) && (
          <article
            className="dashboard-stat-card stat-employes"
            onClick={allerEmployes}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                allerEmployes();
              }
            }}
          >
            <div className="dashboard-stat-header">
              <div className="dashboard-stat-icon">
                <Users size={22} />
              </div>

              <span className="dashboard-stat-badge positive">
                {t("Actifs")}
              </span>
            </div>

            <div className="dashboard-stat-content">
              <span>{t("Employés")}</span>

              <strong>
                {formaterNombre(
                  employesActifs
                )}
              </strong>

              <small>
                {formaterNombre(
                  employesTotal
                )}{" "}
                {t("employés au total")}
              </small>
            </div>

            <div className="dashboard-stat-footer">
              <Users size={13} />
              <span>
                {t("Effectif actuel")}
              </span>

              <ArrowRight size={13} />
            </div>
          </article>
        )}

        {/* TÂCHES */}

        <article
          className="dashboard-stat-card stat-taches"
          onClick={allerTaches}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              allerTaches();
            }
          }}
        >
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon">
              <ClipboardList size={22} />
            </div>

            <span className="dashboard-stat-badge warning">
              {formaterNombre(
                tachesEnCours
              )}{" "}
              {t("en cours")}
            </span>
          </div>

          <div className="dashboard-stat-content">
            <span>{t("Tâches")}</span>

            <strong>
              {formaterNombre(
                tachesTotal
              )}
            </strong>

            <small>
              {formaterNombre(
                tachesTerminees
              )}{" "}
              {t("terminées")}
            </small>
          </div>

          <div className="dashboard-stat-footer">
            <Timer size={13} />
            <span>
              {formaterNombre(
                tachesEnCours
              )}{" "}
              {t("en cours")}
            </span>

            <ArrowRight size={13} />
          </div>
        </article>

        {/* DEMANDES */}

        <article
          className="dashboard-stat-card stat-demandes"
          onClick={allerDemandes}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              allerDemandes();
            }
          }}
        >
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon">
              <FileText size={22} />
            </div>

            <span className="dashboard-stat-badge orange">
              {formaterNombre(
                demandesEnAttente
              )}{" "}
              {t("en attente")}
            </span>
          </div>

          <div className="dashboard-stat-content">
            <span>{t("Demandes")}</span>

            <strong>
              {formaterNombre(
                demandesTotal
              )}
            </strong>

            <small>
              {formaterNombre(
                demandesAcceptees
              )}{" "}
              {t("validées")}
            </small>
          </div>

          <div className="dashboard-stat-footer">
            <Clock3 size={13} />
            <span>
              {formaterNombre(
                demandesEnAttente
              )}{" "}
              {t("à traiter")}
            </span>

            <ArrowRight size={13} />
          </div>
        </article>

        {/* PROGRESSION */}

        <article
          className="dashboard-stat-card stat-progression"
          onClick={allerTaches}
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon">
              <CircleCheck size={22} />
            </div>

            <span className="dashboard-stat-badge positive">
              <ArrowUpRight size={12} />
              {t("Progression")}
            </span>
          </div>

          <div className="dashboard-stat-content">
            <span>
              {t("Avancement")}
            </span>

            <strong>
              {tauxAvancement}%
            </strong>

            <div className="dashboard-mini-progress">
              <span
                style={{
                  width: `${tauxAvancement}%`,
                }}
              />
            </div>
          </div>

          <div className="dashboard-stat-footer">
            <CheckCircle2 size={13} />

            <span>
              {formaterNombre(
                tachesTerminees
              )}{" "}
              {t("tâches terminées")}
            </span>
          </div>
        </article>
      </section>

      {/* =====================================================
          PROGRESSION + SYNTHÈSE
      ====================================================== */}

      <section className="dashboard-indicators">

        <article className="dashboard-indicator-card">
          <div className="dashboard-section-title">
            <div>
              <h2>
                {t("Progression des tâches")}
              </h2>

              <p>
                {t("Suivi global des activités")}
              </p>
            </div>

            <span className="dashboard-stat-badge positive">
              {tauxAvancement}%
            </span>
          </div>

          <div className="dashboard-progress">
            <span
              style={{
                width: `${tauxAvancement}%`,
              }}
            />
          </div>

          <div className="dashboard-indicator-grid">
            <div>
              <strong>
                {formaterNombre(
                  tachesTerminees
                )}
              </strong>

              <span>
                {t("Terminées")}
              </span>
            </div>

            <div>
              <strong>
                {formaterNombre(
                  tachesEnCours
                )}
              </strong>

              <span>
                {t("En cours")}
              </span>
            </div>

            <div>
              <strong>
                {formaterNombre(
                  tachesEnRetard
                )}
              </strong>

              <span>
                {t("En retard")}
              </span>
            </div>
          </div>
        </article>

        <article className="dashboard-indicator-card">
          <div className="dashboard-section-title">
            <div>
              <h2>
                {t("Suivi des demandes")}
              </h2>

              <p>
                {t("État du traitement")}
              </p>
            </div>

            <span className="dashboard-stat-badge orange">
              {tauxDemandes}{t("% validées")}
            </span>
          </div>

          <div className="dashboard-demand-bars">
            <div>
              <span>
                {t("En attente")}
              </span>

              <strong>
                {formaterNombre(
                  demandesEnAttente
                )}
              </strong>
            </div>

            <div className="dashboard-demand-progress">
              <span
                style={{
                  width: `${
                    demandesTotal > 0
                      ? Math.min(
                          100,
                          (demandesEnAttente /
                            demandesTotal) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div>
              <span>
                {t("Acceptées")}
              </span>

              <strong>
                {formaterNombre(
                  demandesAcceptees
                )}
              </strong>
            </div>

            <div className="dashboard-demand-progress success">
              <span
                style={{
                  width: `${
                    demandesTotal > 0
                      ? Math.min(
                          100,
                          (demandesAcceptees /
                            demandesTotal) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div>
              <span>
                {t("Refusées")}
              </span>

              <strong>
                {formaterNombre(
                  demandesRefusees
                )}
              </strong>
            </div>

            <div className="dashboard-demand-progress danger">
              <span
                style={{
                  width: `${
                    demandesTotal > 0
                      ? Math.min(
                          100,
                          (demandesRefusees /
                            demandesTotal) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </article>

      </section>
            {/* =====================================================
          GRILLE PRINCIPALE
      ====================================================== */}

      <section className="dashboard-main-grid">

        {/* TÂCHES RÉCENTES */}

        <article className="dashboard-panel dashboard-panel-large">

          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                {t("TÂCHES")}
              </span>

              <h2>
                {t("Tâches récentes")}
              </h2>
            </div>

            <button
              type="button"
              className="dashboard-panel-link"
              onClick={allerTaches}
            >
              {t("Voir tout")}
              <ArrowRight size={14} />
            </button>
          </div>

          {tachesRecentes.length === 0 ? (
            <div className="dashboard-empty">
              <ClipboardList size={28} />

              <strong>
                {t("Aucune tâche")}
              </strong>

              <span>
                {t("Aucune tâche à afficher pour votre espace.")}
              </span>

              {peutNouvelleTache && (
                <button
                  type="button"
                  onClick={
                    allerNouvelleTache
                  }
                >
                  <Plus size={15} />
                  {t("Créer une tâche")}
                </button>
              )}
            </div>
          ) : (
            <div className="dashboard-task-list">

              {tachesRecentes.map(
                (tache, index) => (
                  <div
                    className="dashboard-task-row"
                    key={
                      tache.id_tache ||
                      tache.id ||
                      `task-${index}`
                    }
                  >

                    <div className="dashboard-task-main">

                      <div className="dashboard-task-title-line">

                        <strong>
                          {tache.titre ||
                            "Tâche sans titre"}
                        </strong>

                        <span
                          className={obtenirClassePriorite(
                            tache.priorite
                          )}
                        >
                          {t(tache.priorite || "Normale")}
                        </span>

                      </div>

                      <span className="dashboard-task-meta">
                        {tache.assigne?.prenom ||
                        tache.assigne?.nom
                          ? `Assignée à ${[
                              tache.assigne
                                ?.prenom,
                              tache.assigne
                                ?.nom,
                            ]
                              .filter(Boolean)
                              .join(" ")}`
                          : t("Non assignée")}
                      </span>

                    </div>

                    <div className="dashboard-task-right">

                      <span
                        className={obtenirClasseStatut(
                          tache.statut
                        )}
                      >
                        {t(tache.statut_libelle ||
                          obtenirTexteStatut(tache.statut))}
                      </span>

                      <small>
                        {formaterDateCourte(
                          tache.date_echeance
                        )}
                      </small>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </article>

        {/* ACTIVITÉ RÉCENTE */}

        <article className="dashboard-panel">

          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-kicker">
                {t("ACTIVITÉ")}
              </span>

              <h2>
                {t("Activité récente")}
              </h2>
            </div>
          </div>

          {activitesRecentes.length === 0 ? (
            <div className="dashboard-empty compact">

              <CheckCircle2 size={25} />

              <strong>
                {t("Aucune activité récente")}
              </strong>

              <span>
                {t("Les nouvelles activités apparaîtront ici.")}
              </span>

            </div>
          ) : (
            <div className="dashboard-activity-list">

              {activitesRecentes.map(
                (activite, index) => (
                  <div
                    className="dashboard-activity-row"
                    key={
                      activite.id ||
                      activite.id_historique ||
                      `activity-${index}`
                    }
                  >

                    <div
                      className={
                        obtenirClasseActivite(
                          activite.type
                        )
                      }
                    >
                      {obtenirIconeActivite(
                        activite.type
                      )}
                    </div>

                    <div className="dashboard-activity-content">

                      <strong>
                        {activite.titre ||
                          activite.message ||
                          "Activité"}
                      </strong>

                      <p>
                        {activite.description ||
                          activite.message ||
                          ""}
                      </p>

                    </div>

                    <time>
                      {formaterHeure(
                        activite.date ||
                          activite.created_at
                      )}
                    </time>

                  </div>
                )
              )}

            </div>
          )}

        </article>

      </section>

      {/* =====================================================
          DEMANDES
      ====================================================== */}

      <section className="dashboard-main-grid dashboard-secondary-grid">

        <article className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-panel-kicker">
                {t("DEMANDES")}
              </span>

              <h2>
                {t("Dernières demandes")}
              </h2>
            </div>

            <button
              type="button"
              className="dashboard-panel-link"
              onClick={allerDemandes}
            >
              {t("Voir tout")}
              <ArrowRight size={14} />
            </button>

          </div>

          {demandesRecentes.length === 0 ? (
            <div className="dashboard-empty compact">

              <FileText size={25} />

              <strong>
                {t("Aucune demande")}
              </strong>

              <span>
                {t("Aucune demande enregistrée.")}
              </span>

              {peutNouvelleDemande && (
                <button
                  type="button"
                  onClick={
                    allerNouvelleDemande
                  }
                >
                  <FilePlus size={15} />
                  {t("Faire une demande")}
                </button>
              )}

            </div>
          ) : (
            <div className="dashboard-request-list">

              {demandesRecentes.map(
                (demande, index) => (
                  <div
                    className="dashboard-request-row"
                    key={
                      demande.id_demande ||
                      demande.id ||
                      `request-${index}`
                    }
                  >

                    <div className="dashboard-request-avatar">
                      {obtenirInitiales(
                        [
                          demande.demandeur
                            ?.prenom,
                          demande.demandeur
                            ?.nom,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                          demande.demandeur_nom ||
                          nomUtilisateur
                      )}
                    </div>

                    <div className="dashboard-request-info">

                      <strong>
                        {t(demande.type_libelle || demande.type_demande || "Demande")}
                      </strong>

                      <span>
                        {demande.objet ||
                          demande.demandeur?.nom ||
                          "Demande interne"}
                      </span>

                    </div>

                    <span
                      className={obtenirClasseStatut(
                        demande.statut
                      )}
                    >
                      {t(demande.statut_libelle ||
                        obtenirTexteStatut(demande.statut))}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </article>

        {/* NOTIFICATIONS */}

        <article className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <span className="dashboard-panel-kicker">
                {t("NOTIFICATIONS")}
              </span>

              <h2>
                {t("À ne pas manquer")}
              </h2>
            </div>

            <div className="dashboard-notification-header-actions">

              {notificationNonLues > 0 && (
                <span className="dashboard-unread-count">
                  {notificationNonLues} {t("non lue")}
                  {notificationNonLues > 1
                    ? "s"
                    : ""}
                </span>
              )}

              <button
                type="button"
                className="dashboard-panel-link"
                onClick={
                  allerNotifications
                }
              >
                {t("Voir tout")}
              </button>

            </div>

          </div>

          {notificationsRecentes.length === 0 ? (
            <div className="dashboard-empty compact">

              <Bell size={25} />

              <strong>
                {t("Aucune notification")}
              </strong>

              <span>
                {t("Vous êtes à jour.")}
              </span>

            </div>
          ) : (
            <div className="dashboard-notification-list">

              {notificationsRecentes.map(
                (notification, index) => (
                  <button
                    type="button"
                    className={`dashboard-notification-row ${
                      notification.lu
                        ? ""
                        : "unread"
                    }`}
                    key={
                      notification.id_notification ||
                      notification.id ||
                      `notification-${index}`
                    }
                    onClick={
                      allerNotifications
                    }
                  >

                    <span
                      className={
                        obtenirClasseNotification(
                          notification.type
                        )
                      }
                    >
                      {obtenirIconeNotification(
                        notification.type
                      )}
                    </span>

                    <span className="dashboard-notification-content">

                      <strong>
                        {notification.titre ||
                          "Notification"}
                      </strong>

                      <small>
                        {notification.message ||
                          notification.description ||
                          ""}
                      </small>

                    </span>

                    <time>
                      {formaterHeure(
                        notification.created_at ||
                          notification.date_lecture
                      )}
                    </time>

                  </button>
                )
              )}

            </div>
          )}

        </article>

      </section>

      {/* =====================================================
          SYNTHÈSE
      ====================================================== */}

      <section className="dashboard-summary-grid">

        <article className="dashboard-summary-card">

          <div className="dashboard-summary-icon">
            <ClipboardList size={20} />
          </div>

          <div>
            <span>
              {t("Tâches terminées")}
            </span>

            <strong>
              {formaterNombre(
                tachesTerminees
              )}
            </strong>
          </div>

        </article>

        <article className="dashboard-summary-card">

          <div className="dashboard-summary-icon warning">
            <Clock3 size={20} />
          </div>

          <div>
            <span>
              {t("Tâches en retard")}
            </span>

            <strong>
              {formaterNombre(
                tachesEnRetard
              )}
            </strong>
          </div>

        </article>

        <article className="dashboard-summary-card">

          <div className="dashboard-summary-icon success">
            <CircleCheck size={20} />
          </div>

          <div>
            <span>
              {t("Demandes acceptées")}
            </span>

            <strong>
              {formaterNombre(
                demandesAcceptees
              )}
            </strong>
          </div>

        </article>

        <article className="dashboard-summary-card">

          <div className="dashboard-summary-icon danger">
            <XCircle size={20} />
          </div>

          <div>
            <span>
              {t("Demandes refusées")}
            </span>

            <strong>
              {formaterNombre(
                demandesRefusees
              )}
            </strong>
          </div>

        </article>

      </section>

      {/* =====================================================
          BAS DU DASHBOARD
      ====================================================== */}

      <section className="dashboard-bottom">

        <article className="dashboard-info-card">

          <div className="dashboard-info-icon">
            <BriefcaseBusiness size={20} />
          </div>

          <div>
            <strong>
              {t("GAIN OFFICE")}
            </strong>

            <p>
              {t("Plateforme interne de gestion des collaborateurs, tâches, demandes et activités de Groupe GAIN SARL.")}
            </p>
          </div>

        </article>

        <article className="dashboard-info-card">

          <div className="dashboard-info-icon success">
            <CircleCheck size={20} />
          </div>

          <div>
            <strong>
              {t("Système opérationnel")}
            </strong>

            <p>
              {t("Les informations affichées proviennent du système GAIN OFFICE et de votre API Laravel.")}
            </p>
          </div>

        </article>

        <article className="dashboard-info-card">

          <div className="dashboard-info-icon warning">
            <CircleAlert size={20} />
          </div>

          <div>
            <strong>
              {t("Suivi en temps réel")}
            </strong>

            <p>
              {t("Le tableau de bord est automatiquement actualisé toutes les 60 secondes.")}
            </p>
          </div>

        </article>

      </section>

    </div>
  );
}

export default Dashboard;
