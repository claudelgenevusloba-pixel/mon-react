import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleX,
  Eye,
  FileText,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { AppDataTable, PageHeader } from "../components/common";
import { PERMISSIONS } from "../config/permissions";
import { aPermission, getRole } from "../config/access";
import { ROLES } from "../config/roles";
import { useLanguage, formaterDateSelonPreference } from "../context/LanguageContext";
import { demandeService } from "../services/demandeService";
import "../styles/pages/demandes.css";

const TYPES_DEMANDE = [
  { value: "conge", label: "Congé" },
  { value: "permission", label: "Permission" },
  { value: "absence", label: "Absence" },
  { value: "avance", label: "Avance / acompte" },
  { value: "achat", label: "Demande d’achat" },
  { value: "materiel", label: "Matériel" },
  { value: "support_informatique", label: "Support informatique" },
  { value: "mission", label: "Mission / déplacement" },
  { value: "document_administratif", label: "Document administratif" },
  { value: "fournitures", label: "Fournitures" },
  { value: "recrutement", label: "Recrutement" },
  { value: "autre", label: "Autre" },
];

const LIBELLES_STATUT = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
  annulee: "Annulée",
};

function obtenirId(demande) {
  return demande?.id_demande ?? demande?.id;
}

function obtenirStatut(demande) {
  return String(demande?.statut ?? "").toLowerCase();
}

function obtenirDemandeur(demande) {
  const personne = demande?.demandeur;
  if (!personne) return "—";
  if (typeof personne === "string") return personne;

  return (
    [personne.prenom, personne.nom].filter(Boolean).join(" ") ||
    personne.email ||
    "—"
  );
}

function obtenirDate(valeur) {
  if (!valeur) return "—";
  try {
    return formaterDateSelonPreference(valeur);
  } catch {
    return String(valeur);
  }
}

function statutClasse(statut) {
  if (statut === "acceptee") return "accepted";
  if (statut === "refusee") return "refused";
  if (statut === "annulee") return "cancelled";
  return "pending";
}

export default function Demandes({ utilisateur }) {
  const { t } = useLanguage();
  const role = getRole(utilisateur);
  const peutVoirSuivi = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_SUIVI_DEMANDES
  );
  const peutCreer =
    aPermission(utilisateur, PERMISSIONS.CREER_DEMANDE) &&
    role !== ROLES.DIRECTEUR;
  const peutAccepter = aPermission(
    utilisateur,
    PERMISSIONS.ACCEPTER_DEMANDE
  );
  const peutRefuser = aPermission(
    utilisateur,
    PERMISSIONS.REFUSER_DEMANDE
  );
  const peutModifier = aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_DEMANDE
  );
  const identifiantUtilisateur =
    utilisateur?.id_utilisateur ?? utilisateur?.id;

  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [actualisation, setActualisation] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreType, setFiltreType] = useState("tous");
  const [selection, setSelection] = useState(null);
  const [modalCreation, setModalCreation] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("success");
  const [formulaire, setFormulaire] = useState({
    type_demande: "absence",
    objet: "",
    description: "",
  });

  const notifier = useCallback((texte, type = "success") => {
    setMessage(texte);
    setTypeMessage(type);
  }, []);

  const chargerDemandes = useCallback(async ({ silencieux = false } = {}) => {
    if (silencieux) setActualisation(true);
    else setChargement(true);

    try {
      const resultat = await demandeService.lister();
      const liste =
        resultat?.demandes ?? resultat?.data ?? resultat?.resultats ?? [];

      setDemandes(
        Array.isArray(liste)
          ? liste.map((demande, index) => ({
              ...demande,
              _rowKey: obtenirId(demande) ?? `demande-${index}`,
            }))
          : []
      );
    } catch (erreur) {
      notifier(
        erreur.message || t("Impossible de charger les demandes."),
        "error"
      );
    } finally {
      setChargement(false);
      setActualisation(false);
    }
  }, [notifier, t]);

  useEffect(() => {
    chargerDemandes();
  }, [chargerDemandes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("nouvelle") === "1" && peutCreer) {
      setModalCreation(true);
    }
  }, [peutCreer]);

  const typesDisponibles = useMemo(() => {
    const codes = new Set(demandes.map((demande) => demande.type_demande).filter(Boolean));
    return TYPES_DEMANDE.filter((type) => codes.has(type.value));
  }, [demandes]);

  const demandesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLocaleLowerCase();

    return demandes.filter((demande) => {
      const statut = obtenirStatut(demande);
      if (filtreStatut !== "tous" && statut !== filtreStatut) return false;
      if (filtreType !== "tous" && demande.type_demande !== filtreType) return false;
      if (!terme) return true;

      return [
        obtenirId(demande),
        demande.objet,
        demande.type_libelle,
        demande.type_demande,
        demande.statut_libelle,
        obtenirDemandeur(demande),
      ].some((valeur) => String(valeur ?? "").toLocaleLowerCase().includes(terme));
    });
  }, [demandes, filtreStatut, filtreType, recherche]);

  const statistiques = useMemo(() => ({
    total: demandes.length,
    attente: demandes.filter((demande) => obtenirStatut(demande) === "en_attente").length,
    acceptees: demandes.filter((demande) => obtenirStatut(demande) === "acceptee").length,
    refusees: demandes.filter((demande) => obtenirStatut(demande) === "refusee").length,
  }), [demandes]);

  const estMaDemande = useCallback((demande) => {
    const idDemandeur =
      demande?.id_demandeur ?? demande?.demandeur?.id_utilisateur;
    return (
      identifiantUtilisateur != null &&
      idDemandeur != null &&
      String(identifiantUtilisateur) === String(idDemandeur)
    );
  }, [identifiantUtilisateur]);

  const peutAnnuler = useCallback((demande) => (
    role === ROLES.EMPLOYE &&
    peutModifier &&
    estMaDemande(demande) &&
    obtenirStatut(demande) === "en_attente"
  ), [estMaDemande, peutModifier, role]);

  const fermerModales = () => {
    if (envoiEnCours || actionEnCours) return;
    setModalCreation(false);
    setSelection(null);
  };

  const envoyerDemande = async (event) => {
    event.preventDefault();
    if (!peutCreer || envoiEnCours) return;

    const objet = formulaire.objet.trim();
    const description = formulaire.description.trim();
    if (!objet || !description) {
      notifier(t("Veuillez remplir tous les champs obligatoires."), "error");
      return;
    }

    setEnvoiEnCours(true);
    try {
      await demandeService.creer({
        type_demande: formulaire.type_demande,
        objet,
        description,
      });
      setModalCreation(false);
      setFormulaire({ type_demande: "absence", objet: "", description: "" });
      notifier(t("Votre demande a été enregistrée."));
      await chargerDemandes({ silencieux: true });
    } catch (erreur) {
      notifier(erreur.message || t("Impossible d’envoyer la demande."), "error");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const traiterDemande = async (demande, decision) => {
    const autorise = decision === "acceptee" ? peutAccepter : peutRefuser;
    if (!autorise || !demande?.peut_traiter || actionEnCours) return;

    setActionEnCours(true);
    try {
      await demandeService.traiter(obtenirId(demande), {
        statut: decision,
      });
      setSelection(null);
      notifier(decision === "acceptee"
        ? t("Votre décision a été enregistrée.")
        : t("La demande a été refusée."));
      await chargerDemandes({ silencieux: true });
    } catch (erreur) {
      notifier(erreur.message || t("Impossible de traiter cette demande."), "error");
    } finally {
      setActionEnCours(false);
    }
  };

  const annulerDemande = async (demande) => {
    if (!peutAnnuler(demande) || actionEnCours) return;
    setActionEnCours(true);
    try {
      await demandeService.annuler(obtenirId(demande));
      setSelection(null);
      notifier(t("La demande a été annulée."));
      await chargerDemandes({ silencieux: true });
    } catch (erreur) {
      notifier(erreur.message || t("Impossible d’annuler cette demande."), "error");
    } finally {
      setActionEnCours(false);
    }
  };

  const colonnes = useMemo(() => [
    {
      id: "id_demande",
      name: t("ID"),
      selector: obtenirId,
      sortable: true,
      width: "84px",
    },
    {
      id: "type_demande",
      name: t("Type"),
      selector: (demande) => demande.type_libelle || demande.type_demande || "—",
      sortable: true,
      wrap: true,
    },
    {
      id: "objet",
      name: t("Objet"),
      selector: (demande) => demande.objet || "—",
      sortable: true,
      grow: 1.4,
      wrap: true,
    },
    ...(peutVoirSuivi ? [{
      id: "demandeur",
      name: t("Demandeur"),
      selector: obtenirDemandeur,
      sortable: true,
      wrap: true,
    }] : []),
    {
      id: "statut",
      name: t("Statut"),
      selector: (demande) => demande.statut_libelle || LIBELLES_STATUT[obtenirStatut(demande)] || demande.statut || "—",
      sortable: true,
      cell: (demande) => {
        const statut = obtenirStatut(demande);
        return (
          <span className={`demande-status ${statutClasse(statut)}`}>
            {t(demande.statut_libelle || LIBELLES_STATUT[statut] || demande.statut || "—")}
          </span>
        );
      },
    },
    {
      id: "date_demande",
      name: t("Date"),
      selector: (demande) => demande.date_demande || "",
      format: (demande) => obtenirDate(demande.date_demande),
      sortable: true,
      width: "130px",
    },
    {
      id: "actions",
      name: t("Actions"),
      button: true,
      ignoreRowClick: true,
      allowOverflow: true,
      width: peutVoirSuivi ? "105px" : "95px",
      cell: (demande) => (
        <div className="demande-row-actions">
          <button
            type="button"
            className="demande-icon-button"
            onClick={() => setSelection(demande)}
            aria-label={`${t("Voir le détail de la demande")} ${obtenirId(demande) ?? ""}`}
            title={t("Voir les détails")}
          >
            <Eye size={16} />
          </button>
          {peutAnnuler(demande) && (
            <button
              type="button"
              className="demande-icon-button danger"
              onClick={() => annulerDemande(demande)}
              disabled={actionEnCours}
              aria-label={`${t("Annuler la demande")} ${obtenirId(demande) ?? ""}`}
              title={t("Annuler")}
            >
              <CircleX size={16} />
            </button>
          )}
        </div>
      ),
    },
  ], [actionEnCours, annulerDemande, peutAnnuler, peutVoirSuivi, t]);

  const demandeSelectionnee = selection;
  const statutSelection = obtenirStatut(demandeSelectionnee);
  const peutTraiterSelection =
    demandeSelectionnee?.peut_traiter === true && statutSelection === "en_attente";

  return (
    <main className="demandes-page">
      <PageHeader
        eyebrow={t("GAIN OFFICE")}
        title={peutVoirSuivi ? t("Suivi des demandes") : t("Mes demandes")}
        description={peutVoirSuivi
          ? t("Consultez les demandes accessibles à votre rôle et traitez uniquement les étapes qui vous sont attribuées.")
          : t("Créez et suivez uniquement vos demandes personnelles.")}
        className="demandes-header"
        actions={(
          <div className="demandes-header-actions">
            <button
              type="button"
              className="demande-secondary-button"
              onClick={() => chargerDemandes({ silencieux: true })}
              disabled={chargement || actualisation}
            >
              <RotateCw size={16} className={actualisation ? "is-spinning" : ""} />
              {t("Actualiser")}
            </button>
            {peutCreer && (
              <button
                type="button"
                className="demandes-primary-button"
                onClick={() => setModalCreation(true)}
              >
                <Plus size={18} />
                {t("Nouvelle demande")}
              </button>
            )}
          </div>
        )}
      />

      {message && (
        <div className={`demande-toast ${typeMessage}`} role="status">
          {typeMessage === "success" ? <Check size={17} /> : <AlertCircle size={17} />}
          <span>{t(message)}</span>
          <button type="button" onClick={() => setMessage("")} aria-label={t("Fermer")}>
            <X size={15} />
          </button>
        </div>
      )}

      <section className="demandes-role-banner">
        <div className="demandes-role-icon">
          {peutVoirSuivi ? <ShieldCheck size={19} /> : <UserRound size={19} />}
        </div>
        <div>
          <strong>{peutVoirSuivi ? t("Suivi selon les permissions") : t("Espace personnel")}</strong>
          <span>{peutVoirSuivi
            ? t("Les décisions sont disponibles uniquement pour le rôle désigné par le circuit de validation.")
            : t("Vous ne voyez que les demandes que vous avez soumises.")}
          </span>
        </div>
      </section>

      <section className="demandes-stats" aria-label={t("Résumé des demandes")}>
        {[
          { label: "Demandes affichées", value: statistiques.total, className: "total", icon: FileText },
          { label: "En attente", value: statistiques.attente, className: "pending", icon: RotateCw },
          { label: "Acceptées", value: statistiques.acceptees, className: "accepted", icon: CheckCircle2 },
          { label: "Refusées", value: statistiques.refusees, className: "refused", icon: CircleX },
        ].map(({ label, value, className, icon: Icon }) => (
          <article className="demande-stat-card" key={className}>
            <div className={`demande-stat-icon ${className}`}><Icon size={19} /></div>
            <div><strong>{value}</strong><span>{t(label)}</span></div>
          </article>
        ))}
      </section>

      <section className="demandes-toolbar" aria-label={t("Filtres des demandes")}>
        <label className="demandes-search">
          <Search size={18} />
          <input
            type="search"
            name="recherche-demandes"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder={t("Rechercher une demande...")}
          />
        </label>
        <select
          aria-label={t("Filtrer par statut")}
          value={filtreStatut}
          onChange={(event) => setFiltreStatut(event.target.value)}
        >
          <option value="tous">{t("Tous les statuts")}</option>
          {Object.entries(LIBELLES_STATUT).map(([value, label]) => (
            <option value={value} key={value}>{t(label)}</option>
          ))}
        </select>
        <select
          aria-label={t("Filtrer par type")}
          value={filtreType}
          onChange={(event) => setFiltreType(event.target.value)}
        >
          <option value="tous">{t("Tous les types")}</option>
          {typesDisponibles.map((type) => (
            <option value={type.value} key={type.value}>{t(type.label)}</option>
          ))}
        </select>
      </section>

      {chargement ? (
        <div className="demandes-state" role="status">{t("Chargement des demandes...")}</div>
      ) : (
        <section className="demandes-table-wrapper" aria-label={t("Liste des demandes")}>
          <AppDataTable
            columns={colonnes}
            data={demandesFiltrees}
            keyField="_rowKey"
            defaultSortFieldId="date_demande"
            defaultSortAsc={false}
            paginationComponentOptions={{
              rowsPerPageText: t("Demandes par page"),
              rangeSeparatorText: t("sur"),
            }}
            noDataMessage={t("Aucune demande ne correspond aux filtres.")}
          />
        </section>
      )}

      {modalCreation && (
        <div className="demande-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) fermerModales();
        }}>
          <form className="demande-modal" onSubmit={envoyerDemande}>
            <div className="demande-modal-header">
              <div>
                <span>{t("NOUVELLE DEMANDE")}</span>
                <h2>{t("Envoyer une demande")}</h2>
                <p>{t("La demande sera enregistrée et transmise au premier valideur.")}</p>
              </div>
              <button type="button" onClick={fermerModales} aria-label={t("Fermer")}><X size={19} /></button>
            </div>

            <div className="demande-modal-body">
              <label>
                {t("Type de demande")}
                <select
                  name="type_demande"
                  value={formulaire.type_demande}
                  onChange={(event) => setFormulaire({ ...formulaire, type_demande: event.target.value })}
                  required
                >
                  {TYPES_DEMANDE.map((type) => (
                    <option value={type.value} key={type.value}>{t(type.label)}</option>
                  ))}
                </select>
              </label>
              <label>
                {t("Objet")}
                <input
                  type="text"
                  name="objet"
                  maxLength={150}
                  value={formulaire.objet}
                  onChange={(event) => setFormulaire({ ...formulaire, objet: event.target.value })}
                  placeholder={t("Objet de votre demande")}
                  required
                />
              </label>
              <label>
                {t("Description")}
                <textarea
                  name="description"
                  rows={5}
                  value={formulaire.description}
                  onChange={(event) => setFormulaire({ ...formulaire, description: event.target.value })}
                  placeholder={t("Expliquez votre demande...")}
                  required
                />
              </label>
            </div>

            <div className="demande-modal-footer">
              <button type="button" onClick={fermerModales} disabled={envoiEnCours}>{t("Annuler")}</button>
              <button type="submit" className="demande-submit" disabled={envoiEnCours}>
                <Check size={16} />
                {envoiEnCours ? t("Envoi en cours...") : t("Envoyer la demande")}
              </button>
            </div>
          </form>
        </div>
      )}

      {demandeSelectionnee && (
        <div className="demande-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) fermerModales();
        }}>
          <section className="demande-detail-modal" role="dialog" aria-modal="true" aria-labelledby="demande-detail-title">
            <div className="demande-modal-header">
              <div>
                <span>{t("DÉTAIL DE LA DEMANDE")}</span>
                <h2 id="demande-detail-title">{demandeSelectionnee.objet}</h2>
                <p>{t("Informations relatives à cette demande.")}</p>
              </div>
              <button type="button" onClick={fermerModales} aria-label={t("Fermer")}><X size={19} /></button>
            </div>
            <div className="demande-detail-body">
              <div className="demande-detail-description">
                <span>{t("Description")}</span>
                <p>{demandeSelectionnee.description || "—"}</p>
              </div>
              <div className="demande-detail-grid">
                <div><span>{t("Demandeur")}</span><strong><UserRound size={14} />{obtenirDemandeur(demandeSelectionnee)}</strong></div>
                <div><span>{t("Type")}</span><strong><FileText size={14} />{t(demandeSelectionnee.type_libelle || demandeSelectionnee.type_demande || "—")}</strong></div>
                <div><span>{t("Date")}</span><strong><CalendarDays size={14} />{obtenirDate(demandeSelectionnee.date_demande)}</strong></div>
                <div>
                  <span>{t("Statut")}</span>
                  <strong className={`detail-status ${statutClasse(statutSelection)}`}>
                    {t(demandeSelectionnee.statut_libelle || LIBELLES_STATUT[statutSelection] || demandeSelectionnee.statut || "—")}
                  </strong>
                </div>
                {demandeSelectionnee.workflow && (
                  <div className="demande-workflow-detail">
                    <span>{t("Étape de validation")}</span>
                    <strong>
                      {demandeSelectionnee.workflow.terminee
                        ? t("Circuit terminé")
                        : `${t("Étape")} ${demandeSelectionnee.workflow.etape}/${demandeSelectionnee.workflow.total} · ${t(demandeSelectionnee.workflow.role || "")}`}
                    </strong>
                  </div>
                )}
                {demandeSelectionnee.traiteur && (
                  <div><span>{t("Traiteur")}</span><strong>{obtenirDemandeur({ demandeur: demandeSelectionnee.traiteur })}</strong></div>
                )}
              </div>
              {demandeSelectionnee.commentaire_traitement && (
                <div className="demande-detail-description">
                  <span>{t("Commentaire de traitement")}</span>
                  <p>{demandeSelectionnee.commentaire_traitement}</p>
                </div>
              )}
            </div>

            {(peutTraiterSelection || peutAnnuler(demandeSelectionnee)) && (
              <div className="demande-processing">
                <div>
                  <ShieldCheck size={18} />
                  <div>
                    <strong>{t("Traitement de la demande")}</strong>
                    <span>{peutTraiterSelection
                      ? t("Votre rôle est autorisé à traiter cette étape.")
                      : t("Vous pouvez annuler cette demande encore en attente.")}
                    </span>
                  </div>
                </div>
                <section>
                  {peutAnnuler(demandeSelectionnee) && (
                    <button type="button" className="demande-refuse" disabled={actionEnCours} onClick={() => annulerDemande(demandeSelectionnee)}>
                      <CircleX size={16} />{t("Annuler la demande")}
                    </button>
                  )}
                  {peutTraiterSelection && peutRefuser && (
                    <button type="button" className="demande-refuse" disabled={actionEnCours} onClick={() => traiterDemande(demandeSelectionnee, "refusee")}>
                      <CircleX size={16} />{t("Refuser")}
                    </button>
                  )}
                  {peutTraiterSelection && peutAccepter && (
                    <button type="button" className="demande-accept" disabled={actionEnCours} onClick={() => traiterDemande(demandeSelectionnee, "acceptee")}>
                      <CheckCircle2 size={16} />{t("Accepter")}
                    </button>
                  )}
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
