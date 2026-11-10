import { useEffect, useMemo, useState } from "react";
import {
  formaterDateSelonPreference,
  useLanguage,
} from "../context/LanguageContext";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  FileStack,
  Flag,
  Inbox,
  Layers,
  ListChecks,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { PERMISSIONS } from "../config/permissions";
import { aPermission, normaliser } from "../config/access";
import { Toast } from "../components/common";
import {
  TaskPriorityBadge,
  TaskProgress,
  TaskStatusBadge,
  TaskSummaryCard,
} from "../components/tasks";
import { useToast } from "../hooks/useToast";
import { getInitials } from "../utils/formatters";
import {
  FORMULAIRE_TACHE_INITIAL,
  PRIORITES_TACHE,
  STATUTS_TACHE,
} from "../data/taches";
import { tacheService } from "../services/tacheService";
import "../styles/pages/taches.css";

const STATUTS_AFFICHES = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "En attente de validation",
  en_attente_validation: "En attente de validation",
  validee: "Validée",
  correction_demandee: "Correction demandée",
};

const PRIORITES_AFFICHES = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

function nomComplet(personne) {
  return [personne?.prenom, personne?.nom].filter(Boolean).join(" ") || "Utilisateur";
}

function datePourChamp(date) {
  return date ? String(date).slice(0, 10) : "";
}

function convertirTache(tache, assignables = []) {
  const idAssigne = Number(tache.id_assigne);
  const assignable = assignables.find(
    (ligne) => Number(ligne.id_utilisateur) === idAssigne,
  );
  const assigne = tache.assigne || assignable;
  const service =
    assigne?.employe?.poste?.service?.nom ||
    assignable?.service ||
    "Service non renseigné";
  const messages = tache.messages || [];

  return {
    id: tache.id_tache,
    id_assigne: idAssigne,
    titre: tache.titre || "",
    description: tache.description || "",
    executant: nomComplet(assigne),
    departement: service,
    priorite: PRIORITES_AFFICHES[tache.priorite] || tache.priorite || "Normale",
    statut: STATUTS_AFFICHES[tache.statut] || tache.statut || "À faire",
    progression: ["terminee", "en_attente_validation", "validee"].includes(tache.statut)
      ? 100
      : tache.statut === "en_cours"
        ? 50
        : 0,
    dateDebut: datePourChamp(tache.date_debut),
    dateEcheance: datePourChamp(tache.date_echeance),
    createur: nomComplet(tache.createur),
    commentaires: messages.map((message) => ({
      id: message.id_message,
      auteur: nomComplet(message.expediteur),
      texte: message.contenu,
      date: message.created_at,
    })),
  };
}

function formatDate(date) {
  return formaterDateSelonPreference(date);
}

export default function Taches({ utilisateur }) {
  const { t } = useLanguage();
  const role = normaliser(utilisateur?.role);
  const estEmploye = role === "employe" || role === "employee" || role === "collaborateur";
  const idUtilisateur = Number(utilisateur?.id_utilisateur || utilisateur?.id);
  const peutCreerTache = aPermission(utilisateur, PERMISSIONS.CREER_TACHE);
  const peutModifierTachePermission = aPermission(utilisateur, PERMISSIONS.MODIFIER_TACHE);
  const peutSupprimerTachePermission = aPermission(utilisateur, PERMISSIONS.SUPPRIMER_TACHE);
  const peutAssignerTache = aPermission(utilisateur, PERMISSIONS.ASSIGNER_TACHE);
  const peutTerminerTachePermission = aPermission(utilisateur, PERMISSIONS.TERMINER_TACHE);
  const peutValiderTachePermission = aPermission(utilisateur, PERMISSIONS.VALIDER_TACHE);
  const [taches, setTaches] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");
  const [chargementDetails, setChargementDetails] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtrePriorite, setFiltrePriorite] = useState("Toutes");
  const [filtreDepartement, setFiltreDepartement] = useState("Tous");
  const [page, setPage] = useState(1);
  const [menuOuvert, setMenuOuvert] = useState(null);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [tacheSelectionnee, setTacheSelectionnee] = useState(null);
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const {
    toast,
    showToast: afficherToast,
    clearToast: fermerToast
  } = useToast();
  const [formulaire, setFormulaire] = useState(FORMULAIRE_TACHE_INITIAL);
  const elementsParPage = 8;

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      setChargement(true);
      setErreurChargement("");
      try {
        const reponseTaches = await tacheService.lister();
        if (!actif) return;
        setTaches((reponseTaches?.taches || []).map((tache) => convertirTache(tache)));
        if (peutAssignerTache) {
          try {
            const reponseAssignables = await tacheService.assignables();
            if (actif) setEmployes(reponseAssignables?.assignables || []);
          } catch {
            // La liste des tâches reste accessible si le rôle n'a pas accès à l'annuaire.
            if (actif) setEmployes([]);
          }
        }
      } catch (error) {
        if (actif) setErreurChargement(error.message || "Impossible de charger les tâches.");
      } finally {
        if (actif) setChargement(false);
      }
    };

    charger();
    return () => {
      actif = false;
    };
  }, [peutAssignerTache]);

  const rechargerTaches = async () => {
    setChargement(true);
    setErreurChargement("");
    try {
      const reponse = await tacheService.lister();
      setTaches((reponse.taches || []).map((tache) => convertirTache(tache, employes)));
    } catch (error) {
      setErreurChargement(error.message || "Impossible de charger les tâches.");
    } finally {
      setChargement(false);
    }
  };

  const servicesDisponibles = useMemo(() => [...new Set(taches
    .map((tache) => tache.departement)
    .filter((service) => service && service !== "Service non renseigné"))]
    .sort((a, b) => a.localeCompare(b)), [taches]);

  const estMaTache = tache => {
    return estEmploye && Number(tache.id_assigne) === idUtilisateur;
  };
  const peutModifierTache = () => peutModifierTachePermission;
  const tachesVisibles = useMemo(() => {
    if (estEmploye) {
      return taches.filter((tache) => Number(tache.id_assigne) === idUtilisateur);
    }
    return taches;
  }, [taches, estEmploye, idUtilisateur]);
  const tachesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return tachesVisibles.filter(t => {
      const rechercheOK = !terme || t.titre.toLowerCase().includes(terme) || t.description.toLowerCase().includes(terme) || t.executant.toLowerCase().includes(terme) || t.departement.toLowerCase().includes(terme);
      const statutOK = filtreStatut === "Tous" || t.statut === filtreStatut;
      const prioriteOK = filtrePriorite === "Toutes" || t.priorite === filtrePriorite;
      const departementOK = filtreDepartement === "Tous" || t.departement === filtreDepartement;
      return rechercheOK && statutOK && prioriteOK && departementOK;
    });
  }, [tachesVisibles, recherche, filtreStatut, filtrePriorite, filtreDepartement]);
  const totalPages = Math.max(1, Math.ceil(tachesFiltrees.length / elementsParPage));
  const pageActuelle = Math.min(page, totalPages);
  const tachesAffichees = useMemo(() => {
    const debut = (pageActuelle - 1) * elementsParPage;
    return tachesFiltrees.slice(debut, debut + elementsParPage);
  }, [tachesFiltrees, pageActuelle]);
  const statistiques = useMemo(() => ({
    total: tachesVisibles.length,
    aFaire: tachesVisibles.filter(t => t.statut === "À faire").length,
    enCours: tachesVisibles.filter(t => t.statut === "En cours").length,
    validation: tachesVisibles.filter(t => t.statut === "En attente de validation").length,
    validees: tachesVisibles.filter(t => t.statut === "Validée").length
  }), [tachesVisibles]);
  const ouvrirCreation = () => {
    if (!peutCreerTache) {
      afficherToast("Vous n'avez pas l'autorisation de créer une tâche.", "error");
      return;
    }
    setTacheSelectionnee(null);
    setFormulaire(FORMULAIRE_TACHE_INITIAL);
    setModalOuverte(true);
    setMenuOuvert(null);
  };
  const ouvrirModification = tache => {
    if (!peutModifierTachePermission) {
      afficherToast("Vous n'avez pas l'autorisation de modifier une tâche.", "error");
      return;
    }
    setTacheSelectionnee(tache);
    setFormulaire({
      titre: tache.titre,
      description: tache.description || "",
      executant: String(tache.id_assigne || ""),
      priorite: tache.priorite,
      dateDebut: tache.dateDebut || "",
      dateEcheance: tache.dateEcheance || ""
    });
    setModalOuverte(true);
    setMenuOuvert(null);
  };
  const fermerModal = () => {
    setModalOuverte(false);
    setFormulaire(FORMULAIRE_TACHE_INITIAL);
  };
  const modifierFormulaire = e => {
    const {
      name,
      value
    } = e.target;
    setFormulaire((ancien) => ({ ...ancien, [name]: value }));
  };
  const enregistrerTache = async (e) => {
    e.preventDefault();
    if (tacheSelectionnee && !peutModifierTachePermission) {
      afficherToast("Vous n'avez pas l'autorisation de modifier cette tâche.", "error");
      return;
    }
    if (!tacheSelectionnee && !peutCreerTache) {
      afficherToast("Vous n'avez pas l'autorisation de créer une tâche.", "error");
      return;
    }
    if (!formulaire.titre.trim() || !formulaire.executant || !formulaire.dateEcheance) {
      afficherToast("Veuillez remplir les champs obligatoires.", "error");
      return;
    }
    const assignableSelectionne = employes.find(
      (ligne) => String(ligne.id_utilisateur) === formulaire.executant,
    );
    if (!assignableSelectionne) {
      afficherToast("Sélectionnez un compte autorisé existant.", "error");
      return;
    }
    const donnees = {
      titre: formulaire.titre.trim(),
      description: formulaire.description.trim() || null,
      id_assigne: Number(formulaire.executant),
      priorite: formulaire.priorite.toLowerCase(),
      date_debut: formulaire.dateDebut || null,
      date_echeance: formulaire.dateEcheance,
    };

    setEnregistrement(true);
    try {
      if (tacheSelectionnee) {
        await tacheService.modifier(tacheSelectionnee.id, donnees);
        afficherToast("La tâche a été modifiée avec succès.");
      } else {
        await tacheService.creer(donnees);
        afficherToast("La tâche a été créée avec succès.");
      }
      await rechargerTaches();
      setModalOuverte(false);
      setFormulaire(FORMULAIRE_TACHE_INITIAL);
    } catch (error) {
      afficherToast(error.message || "Impossible d'enregistrer la tâche.", "error");
    } finally {
      setEnregistrement(false);
    }
  };
  const ouvrirDetails = async (tache) => {
    setTacheSelectionnee(tache);
    setMenuOuvert(null);
    setNouveauCommentaire("");
    setChargementDetails(true);
    try {
      const reponse = await tacheService.details(tache.id);
      if (reponse.tache) setTacheSelectionnee(convertirTache(reponse.tache, employes));
    } catch (error) {
      afficherToast(error.message || "Impossible de charger les détails.", "error");
    } finally {
      setChargementDetails(false);
    }
  };
  const supprimerTache = async (id) => {
    if (!peutSupprimerTachePermission) {
      afficherToast("Vous n'avez pas l'autorisation de supprimer une tâche.", "error");
      return;
    }
    try {
      await tacheService.supprimer(id);
      setTaches((anciens) => anciens.filter((tache) => tache.id !== id));
      setTacheSelectionnee(null);
      afficherToast("La tâche a été supprimée.", "success");
    } catch (error) {
      afficherToast(error.message || "Impossible de supprimer la tâche.", "error");
    }
  };
  const changerStatutEmploye = async (tache) => {
    if (!estEmploye || !estMaTache(tache)) {
      afficherToast("Vous ne pouvez modifier que vos propres tâches.", "error");
      return;
    }
    const statut = tache.statut === "En cours" ? "terminee" : "en_cours";
    try {
      const reponse = await tacheService.modifier(tache.id, { statut });
      const miseAJour = convertirTache(reponse.tache || { ...tache, statut }, employes);
      setTaches((anciens) => anciens.map((item) => item.id === tache.id ? miseAJour : item));
      setTacheSelectionnee(miseAJour);
      afficherToast("Le statut de la tâche a été mis à jour.", "success");
    } catch (error) {
      afficherToast(error.message || "Impossible de mettre à jour le statut.", "error");
    }
  };
  const ajouterCommentaire = async () => {
    if (!tacheSelectionnee || !nouveauCommentaire.trim()) return;
    try {
      await tacheService.commenter(tacheSelectionnee.id, nouveauCommentaire.trim());
      const reponse = await tacheService.details(tacheSelectionnee.id);
      if (reponse.tache) {
        const miseAJour = convertirTache(reponse.tache, employes);
        setTacheSelectionnee(miseAJour);
        setTaches((anciens) => anciens.map((item) => item.id === miseAJour.id ? miseAJour : item));
      }
      setNouveauCommentaire("");
      afficherToast("Commentaire ajouté.", "success");
    } catch (error) {
      afficherToast(error.message || "Impossible d'ajouter le commentaire.", "error");
    }
  };
  const mettreAJourStatut = async (tache, statut, message) => {
    try {
      const reponse = await tacheService.modifier(tache.id, { statut });
      const miseAJour = convertirTache(reponse.tache || { ...tache, statut }, employes);
      setTaches((anciens) => anciens.map((item) => item.id === tache.id ? miseAJour : item));
      setTacheSelectionnee(miseAJour);
      afficherToast(message, "success");
    } catch (error) {
      afficherToast(error.message || "Impossible de mettre à jour le statut.", "error");
    }
  };
  const demanderCorrection = (tache) => mettreAJourStatut(tache, "correction_demandee", "Une correction a été demandée.");
  const validerTache = (tache) => mettreAJourStatut(tache, "validee", "La tâche a été validée.");
  return <div className="tasks-page">
      <div className="tasks-shell">
        <div className="tasks-header">
          <div className="tasks-header-left">
            <div className="tasks-icon-deco"><ClipboardList size={22} /></div>
            <div>
              <span className="tasks-kicker"><Sparkles size={12} /> {t("GESTION DES TÂCHES")}</span>
              <h1>{t("Tableau de bord des tâches")}</h1>
              <p className="tasks-subtitle">{t("Suivez et gérez les tâches de Groupe GAIN SARL")}</p>
            </div>
          </div>
          {peutCreerTache && <button type="button" className="primary-task-button" onClick={ouvrirCreation}><Plus size={17} /> {t("Nouvelle tâche")}</button>}
        </div>

        <div className="tasks-summary">
          <TaskSummaryCard icon={FileStack} tone="blue" label={t("Total")} value={statistiques.total} />
          <TaskSummaryCard icon={Inbox} tone="gray" label={t("À faire")} value={statistiques.aFaire} />
          <TaskSummaryCard icon={Timer} tone="light-blue" label={t("En cours")} value={statistiques.enCours} />
          <TaskSummaryCard icon={Layers} tone="orange" label={t("Validation")} value={statistiques.validation} />
          <TaskSummaryCard icon={CheckCircle2} tone="green" label={t("Validées")} value={statistiques.validees} />
        </div>

        <div className="tasks-toolbar">
          <div className="search-box"><Search size={16} /><input type="text" value={recherche} onChange={e => setRecherche(e.target.value)} placeholder={t("Rechercher une tâche...")} /></div>
          <div className="filters-box">
            <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}><option value="Tous">{t("Tous les statuts")}</option>{STATUTS_TACHE.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select value={filtrePriorite} onChange={e => setFiltrePriorite(e.target.value)}><option value="Toutes">{t("Toutes priorités")}</option>{PRIORITES_TACHE.map(p => <option key={p} value={p}>{p}</option>)}</select>
            <select value={filtreDepartement} onChange={e => setFiltreDepartement(e.target.value)}><option value="Tous">{t("Tous services")}</option>{servicesDisponibles.map(d => <option key={d} value={d}>{d}</option>)}</select>
          </div>
        </div>

        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead><tr><th>{t("TÂCHE")}</th><th>{t("EXÉCUTANT")}</th><th>{t("SERVICE")}</th><th>{t("PRIORITÉ")}</th><th>{t("ÉCHÉANCE")}</th><th>{t("STATUT")}</th><th>{t("PROGRESSION")}</th><th>{t("ACTIONS")}</th></tr></thead>
            <tbody>
              {chargement ? <tr><td colSpan="8"><div className="empty-tasks"><p>{t("Chargement des tâches...")}</p></div></td></tr> : erreurChargement ? <tr><td colSpan="8"><div className="empty-tasks"><div className="empty-icon"><AlertTriangle size={30} /></div><h3>{t("Impossible de charger les tâches")}</h3><p>{erreurChargement}</p><button type="button" className="secondary-task-button" onClick={rechargerTaches}>{t("Réessayer")}</button></div></td></tr> : tachesAffichees.length === 0 ? <tr><td colSpan="8"><div className="empty-tasks"><div className="empty-icon"><ListChecks size={32} /></div><h3>{t("Aucune tâche trouvée")}</h3><p>{t("Modifiez vos critères de recherche ou de filtrage.")}</p></div></td></tr> : tachesAffichees.map(tache => <tr key={tache.id}>
                    <td><div className="task-title-cell"><strong>{tache.titre}</strong><span>{tache.description || "Aucune description"}</span></div></td>
                    <td><div className="task-user-cell"><div className="task-avatar">{getInitials(tache.executant, "")}</div><div><strong>{tache.executant}</strong><span>{t("Collaborateur")}</span></div></div></td>
                    <td>{tache.departement}</td>
                    <td><TaskPriorityBadge priority={tache.priorite} label={t(tache.priorite)} /></td>
                    <td><div className="task-date"><CalendarDays size={15} />{formatDate(tache.dateEcheance)}</div></td>
                    <td><TaskStatusBadge status={tache.statut} label={t(tache.statut)} /></td>
                    <td><TaskProgress value={tache.progression} /></td>
                    <td>
                      <div className="task-actions">
                        {estEmploye && estMaTache(tache) && peutTerminerTachePermission && (tache.statut === "À faire" || tache.statut === "Correction demandée" || tache.statut === "En cours") && <button type="button" className="icon-task-button" title={tache.statut === "En cours" ? t("Terminer") : t("Démarrer")} onClick={() => changerStatutEmploye(tache)}>{tache.statut === "En cours" ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}</button>}
                        <button type="button" className="icon-task-button" onClick={() => ouvrirDetails(tache)}><Search size={17} /></button>
                        {peutModifierTache() && <button type="button" className="icon-task-button" onClick={() => ouvrirModification(tache)}><Pencil size={17} /></button>}
                        {peutSupprimerTachePermission && <button type="button" className="icon-task-button danger" onClick={() => supprimerTache(tache.id)}><Trash2 size={17} /></button>}
                        <div className="task-menu-wrapper">
                          <button type="button" className="icon-task-button" onClick={() => setMenuOuvert(menuOuvert === tache.id ? null : tache.id)}><MoreHorizontal size={17} /></button>
                          {menuOuvert === tache.id && <div className="task-actions-menu">
                              <button type="button" onClick={() => ouvrirDetails(tache)}><Search size={15} /> {t("Voir les détails")}</button>
                              {peutModifierTache() && <button type="button" onClick={() => ouvrirModification(tache)}><Pencil size={15} /> {t("Modifier")}</button>}
                              {peutSupprimerTachePermission && <button type="button" className="danger" onClick={() => supprimerTache(tache.id)}><Trash2 size={15} /> {t("Supprimer")}</button>}
                            </div>}
                        </div>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        <div className="tasks-pagination">
          <div className="pagination-info"><span>{t("Affichage de")} <strong>{tachesAffichees.length}</strong> {t("tâche(s) sur")} <strong>{tachesFiltrees.length}</strong></span></div>
          <div className="pagination-controls">
            <button type="button" className="pagination-button" disabled={pageActuelle <= 1} onClick={() => setPage(a => Math.max(1, a - 1))}><ChevronLeft size={16} /></button>
            <span className="pagination-current">{pageActuelle}</span><span className="pagination-separator">/</span><span className="pagination-total">{totalPages}</span>
            <button type="button" className="pagination-button" disabled={pageActuelle >= totalPages} onClick={() => setPage(a => Math.min(totalPages, a + 1))}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {modalOuverte && <div className="task-modal-overlay" onMouseDown={fermerModal}>
          <div className="task-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="task-modal-header"><div><span className="modal-kicker">{tacheSelectionnee ? t("MODIFICATION") : t("NOUVELLE TÂCHE")}</span><h2>{tacheSelectionnee ? t("Modifier la tâche") : t("Créer une tâche")}</h2><p>{tacheSelectionnee ? t("Mettez à jour les informations de la tâche.") : t("Créez une nouvelle tâche et attribuez-la à un collaborateur.")}</p></div><button type="button" className="modal-close" onClick={fermerModal}><X size={20} /></button></div>
            <form onSubmit={enregistrerTache}>
              <div className="task-modal-body">
                <div className="form-group full"><label>{t("Titre de la tâche")}</label><input name="titre" type="text" value={formulaire.titre} onChange={modifierFormulaire} placeholder={t("Ex. Préparer le rapport mensuel")} required /></div>
                <div className="form-group full"><label>{t("Description")}</label><textarea name="description" value={formulaire.description} onChange={modifierFormulaire} placeholder={t("Décrivez le travail à réaliser...")} rows={4} /></div>
                <div className="form-grid">
                  <div className="form-group full"><label>{t("Collaborateur")}</label><select name="executant" value={formulaire.executant} onChange={modifierFormulaire} required><option value="">{t("Sélectionner un collaborateur")}</option>{employes.map((personne) => <option key={personne.id_utilisateur} value={personne.id_utilisateur}>{nomComplet(personne)}{personne.service ? ` — ${personne.service}` : personne.role ? ` — ${personne.role}` : ""}</option>)}</select>{employes.length === 0 && <small>{t("Aucun collaborateur disponible avec vos permissions actuelles.")}</small>}</div>
                  <div className="form-group"><label>{t("Priorité")}</label><select name="priorite" value={formulaire.priorite} onChange={modifierFormulaire}>{PRIORITES_TACHE.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>{t("Date de début")}</label><input name="dateDebut" type="date" value={formulaire.dateDebut} onChange={modifierFormulaire} /></div>
                  <div className="form-group"><label>{t("Date d'échéance")}</label><input name="dateEcheance" type="date" value={formulaire.dateEcheance} onChange={modifierFormulaire} required /></div>
                </div>
              </div>
              <div className="task-modal-footer"><button type="button" className="secondary-task-button" onClick={fermerModal}>{t("Annuler")}</button><button type="submit" className="primary-task-button" disabled={enregistrement || employes.length === 0}><Check size={17} />{enregistrement ? t("Enregistrement...") : tacheSelectionnee ? t("Enregistrer") : t("Créer la tâche")}</button></div>
            </form>
          </div>
        </div>}

      {tacheSelectionnee && !modalOuverte && <div className="task-modal-overlay" onMouseDown={() => {
      setTacheSelectionnee(null);
      setNouveauCommentaire("");
    }}>
          <div className="task-modal xlarge" onMouseDown={e => e.stopPropagation()}>
            <div className="task-modal-header"><div><span className="modal-kicker">{t("DÉTAILS DE LA TÂCHE")}</span><h2>{tacheSelectionnee.titre}</h2><p>{t("Créée par")} {tacheSelectionnee.createur}</p></div><button type="button" className="modal-close" onClick={() => {
            setTacheSelectionnee(null);
            setNouveauCommentaire("");
          }}><X size={20} /></button></div>
            <div className="task-detail-body">
              {chargementDetails && <div className="task-detail-loading">{t("Chargement des détails...")}</div>}
              <main className="task-detail-main">
                <div className="task-detail-badges">
                  <TaskStatusBadge status={tacheSelectionnee.statut} label={t(tacheSelectionnee.statut)} />
                  <TaskPriorityBadge priority={tacheSelectionnee.priorite} label={t(tacheSelectionnee.priorite)} />
                </div>
                <section className="detail-section"><h3>{t("Description")}</h3><p className="description-text">{tacheSelectionnee.description || t("Aucune description renseignée.")}</p></section>
                <section className="detail-section">
                  <div className="detail-section-title">
                    <strong>{t("Progression")}</strong>
                    <strong>{tacheSelectionnee.progression}%</strong>
                  </div>
                  <TaskProgress value={tacheSelectionnee.progression} variant="detail" />
                </section>
                {tacheSelectionnee.statut === "En attente de validation" && peutValiderTachePermission && <div className="report-card"><div className="report-card-header"><div><CheckCircle2 size={18} /><strong>{t("Travail terminé")}</strong></div><span>{t("À vérifier")}</span></div><div className="report-content"><p>{t("L'exécutant a déclaré cette tâche terminée. Vérifiez le travail avant de procéder à la validation.")}</p><div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap"
                }}><button type="button" className="secondary-task-button" onClick={() => demanderCorrection(tacheSelectionnee)}><RotateCcw size={15} /> {t("Demander une correction")}</button><button type="button" className="primary-task-button" onClick={() => validerTache(tacheSelectionnee)}><Check size={15} /> {t("Valider la tâche")}</button></div></div></div>}
                <section className="discussion-section">
                  <div className="discussion-header"><div><MessageCircle size={17} /><h3>{t("Discussion")}</h3></div><span>{(tacheSelectionnee.commentaires || []).length} {t("commentaire(s)")}</span></div>
                  <div className="messages-list">
                    {tacheSelectionnee.commentaires?.length ? tacheSelectionnee.commentaires.map(c => <div className="task-message" key={c.id}><div className="task-avatar">{getInitials(c.auteur, "")}</div><div><div className="message-meta"><strong>{c.auteur}</strong><small>{formatDate(c.date)}</small></div><p>{c.texte}</p></div></div>) : <div className="empty-messages">{t("Aucun commentaire pour le moment.")}<p>{t("Utilisez le champ ci-dessous pour démarrer la discussion.")}</p></div>}
                  </div>
                  <div className="message-composer"><input type="text" value={nouveauCommentaire} onChange={e => setNouveauCommentaire(e.target.value)} onKeyDown={e => {
                  if (e.key === "Enter") ajouterCommentaire();
                }} placeholder={t("Écrire un commentaire...")} /><button type="button" onClick={ajouterCommentaire}><MessageCircle size={17} /></button></div>
                </section>
              </main>
              <aside className="task-detail-sidebar">
                <div className="detail-person"><div className="task-avatar large">{getInitials(tacheSelectionnee.executant, "")}</div><strong>{tacheSelectionnee.executant}</strong><span>{tacheSelectionnee.departement}</span></div>
                <div className="detail-info-list">
                  <div><User size={16} /><span><small>{t("Exécutant")}</small><strong>{tacheSelectionnee.executant}</strong></span></div>
                  <div><Users size={16} /><span><small>{t("Service")}</small><strong>{tacheSelectionnee.departement}</strong></span></div>
                  <div><User size={16} /><span><small>{t("Créée par")}</small><strong>{tacheSelectionnee.createur}</strong></span></div>
                  <div><CalendarDays size={16} /><span><small>{t("Date de début")}</small><strong>{formatDate(tacheSelectionnee.dateDebut)}</strong></span></div>
                  <div><CalendarDays size={16} /><span><small>{t("Échéance")}</small><strong>{formatDate(tacheSelectionnee.dateEcheance)}</strong></span></div>
                  <div><Flag size={16} /><span><small>{t("Priorité")}</small><strong>{tacheSelectionnee.priorite}</strong></span></div>
                </div>
                {estEmploye && estMaTache(tacheSelectionnee) && (tacheSelectionnee.statut === "À faire" || tacheSelectionnee.statut === "En cours" || tacheSelectionnee.statut === "Correction demandée") && <button type="button" className="primary-task-button" style={{
              width: "100%"
            }} onClick={() => changerStatutEmploye(tacheSelectionnee)}>{tacheSelectionnee.statut === "En cours" ? <><Check size={16} /> {t("Déclarer terminée")}</> : <><Clock3 size={16} /> {t("Commencer la tâche")}</>}</button>}
              </aside>
            </div>
          </div>
        </div>}

      <Toast message={toast ? t(toast.message) : ""} type={toast?.type} onClose={fermerToast} className="task-toast" />
    </div>;
}
