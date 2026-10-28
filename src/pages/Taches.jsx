import { useMemo, useState } from "react"
import { useLanguage } from "../context/LanguageContext";
import { formaterDateSelonPreference } from "../context/LanguageContext";
import {
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Flag, MessageCircle, MoreHorizontal, Pencil, Plus, RotateCcw, Search,
  Trash2, User, Users, X, ListChecks, FileStack, Timer, AlertTriangle,
  Sparkles, ClipboardList, Inbox, Layers
} from "lucide-react"
import { PERMISSIONS } from "../config/permissions"
import { aPermission } from "../config/access"
import "../styles/pages/taches.css"

const STATUTS = ["À faire", "En cours", "En attente de validation", "Validée", "Correction demandée"]
const PRIORITES = ["Basse", "Normale", "Haute", "Urgente"]
const DEPARTEMENTS = ["Ressources Humaines","Informatique","Commercial","Comptabilité","Marketing","Administration"]
const EMPLOYES = ["Claudel Genevus Loba","Koffi Yao","Awa Konan","Jean Kouassi","Marie N'Guessan","Serge Kouamé"]

const TACHES_INITIAL = [
  { id: 1, titre: "Préparer le rapport mensuel", description: "Préparer le rapport mensuel des activités et transmettre la synthèse à la direction.", executant: "Claudel Genevus Loba", departement: "Administration", priorite: "Haute", statut: "En cours", progression: 65, dateDebut: "2026-09-20", dateEcheance: "2026-09-30", createur: "Direction", commentaires: [{id:1,auteur:"Direction",texte:"Merci de mettre à jour les chiffres avant vendredi.",date:"2026-09-27"}]},
  { id: 2, titre: "Mise à jour des dossiers clients", description: "Contrôler et mettre à jour les informations présentes dans les dossiers clients.", executant: "Koffi Yao", departement: "Commercial", priorite: "Normale", statut: "À faire", progression: 0, dateDebut: "2026-09-28", dateEcheance: "2026-10-03", createur: "Responsable", commentaires: [] },
  { id: 3, titre: "Préparer les éléments comptables", description: "Rassembler les pièces nécessaires à la préparation du point comptable.", executant: "Awa Konan", departement: "Comptabilité", priorite: "Urgente", statut: "En attente de validation", progression: 100, dateDebut: "2026-09-15", dateEcheance: "2026-09-29", createur: "Direction", commentaires: [{id:2,auteur:"Awa Konan",texte:"Le travail est terminé et les documents sont disponibles.",date:"2026-09-29"}]},
  { id: 4, titre: "Préparer la campagne commerciale", description: "Préparer les éléments nécessaires à la prochaine campagne commerciale.", executant: "Jean Kouassi", departement: "Marketing", priorite: "Haute", statut: "Validée", progression: 100, dateDebut: "2026-09-10", dateEcheance: "2026-09-25", createur: "Responsable", commentaires: [] },
  { id: 5, titre: "Classement des documents administratifs", description: "Organiser et classer les documents administratifs de l'entreprise.", executant: "Marie N'Guessan", departement: "Administration", priorite: "Basse", statut: "Correction demandée", progression: 0, dateDebut: "2026-09-22", dateEcheance: "2026-10-01", createur: "RH", commentaires: [] },
]

const FORMULAIRE_INITIAL = { titre: "", description: "", executant: "", departement: "", priorite: "Normale", dateDebut: "", dateEcheance: "" }

function normaliserRole(role){ return String(role||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") }
function formatDate(date){ return formaterDateSelonPreference(date); }
function getInitiales(nom=""){ return nom.split(" ").filter(Boolean).map(m=>m[0]).slice(0,2).join("").toUpperCase() }
function statutClasse(s){ switch(s){ case "En cours": return "progress"; case "En attente de validation": return "validation"; case "Validée": return "validated"; case "Correction demandée": return "correction"; default: return "todo"; } }
function prioriteClasse(p){ switch(p){ case "Basse": return "low"; case "Haute": return "high"; case "Urgente": return "urgent"; default: return "normal"; } }
function StatutIcone({statut}){ if(statut==="Validée") return <CheckCircle2 size={13}/>; if(statut==="Correction demandée") return <RotateCcw size={13}/>; if(statut==="En attente de validation") return <CheckCircle2 size={13}/>; return <Clock3 size={13}/> }

export default function Taches({ utilisateur }){
  const { t } = useLanguage();
  const role = normaliserRole(utilisateur?.role)
  const estDirecteur = role==="directeur"||role==="direction"
  const estRH = role==="rh"||role==="ressources humaines"||role==="ressources_humaines"
  const estResponsable = role==="responsable"||role==="manager"||role==="chef"
  const estEmploye = role==="employe"||role==="employee"||role==="collaborateur"
  const nomUtilisateur = utilisateur?.nom || utilisateur?.name || utilisateur?.prenomNom || "Claudel Genevus Loba"

  const peutVoirTaches = aPermission(utilisateur, PERMISSIONS.VOIR_TACHES)
  const peutCreerTache = aPermission(utilisateur, PERMISSIONS.CREER_TACHE)
  const peutModifierTachePermission = aPermission(utilisateur, PERMISSIONS.MODIFIER_TACHE)
  const peutSupprimerTachePermission = aPermission(utilisateur, PERMISSIONS.SUPPRIMER_TACHE)
  const peutAssignerTache = aPermission(utilisateur, PERMISSIONS.ASSIGNER_TACHE)
  const peutTerminerTachePermission = aPermission(utilisateur, PERMISSIONS.TERMINER_TACHE)
  const peutValiderTachePermission = aPermission(utilisateur, PERMISSIONS.VALIDER_TACHE)
  const peutGerer = peutCreerTache || peutModifierTachePermission || peutSupprimerTachePermission || peutAssignerTache

  const [taches,setTaches]=useState(TACHES_INITIAL)
  const [recherche,setRecherche]=useState("")
  const [filtreStatut,setFiltreStatut]=useState("Tous")
  const [filtrePriorite,setFiltrePriorite]=useState("Toutes")
  const [filtreDepartement,setFiltreDepartement]=useState("Tous")
  const [page,setPage]=useState(1)
  const [menuOuvert,setMenuOuvert]=useState(null)
  const [modalOuverte,setModalOuverte]=useState(false)
  const [tacheSelectionnee,setTacheSelectionnee]=useState(null)
  const [nouveauCommentaire,setNouveauCommentaire]=useState("")
  const [toast,setToast]=useState(null)
  const [formulaire,setFormulaire]=useState(FORMULAIRE_INITIAL)
  const elementsParPage=8

  const afficherToast=(message,type="success")=>{ setToast({message,type}); window.setTimeout(()=>setToast(null),3500) }
  const estMaTache=(tache)=>{ if(!estEmploye) return false; return tache.executant.toLowerCase()===nomUtilisateur.toLowerCase() }
  const peutModifierTache=()=>peutModifierTachePermission
  const peutValider=(tache)=> peutValiderTachePermission && tache.statut==="En attente de validation"

  const tachesVisibles=useMemo(()=>{ if(estEmploye) return taches.filter(estMaTache); return taches },[taches,estEmploye,nomUtilisateur])
  const tachesFiltrees=useMemo(()=>{
    const terme=recherche.trim().toLowerCase()
    return tachesVisibles.filter(t=>{
      const rechercheOK=!terme || t.titre.toLowerCase().includes(terme) || t.description.toLowerCase().includes(terme) || t.executant.toLowerCase().includes(terme) || t.departement.toLowerCase().includes(terme)
      const statutOK=filtreStatut==="Tous"||t.statut===filtreStatut
      const prioriteOK=filtrePriorite==="Toutes"||t.priorite===filtrePriorite
      const departementOK=filtreDepartement==="Tous"||t.departement===filtreDepartement
      return rechercheOK&&statutOK&&prioriteOK&&departementOK
    })
  },[tachesVisibles,recherche,filtreStatut,filtrePriorite,filtreDepartement])

  const totalPages=Math.max(1,Math.ceil(tachesFiltrees.length/elementsParPage))
  const pageActuelle=Math.min(page,totalPages)
  const tachesAffichees=useMemo(()=>{ const debut=(pageActuelle-1)*elementsParPage; return tachesFiltrees.slice(debut,debut+elementsParPage) },[tachesFiltrees,pageActuelle])
  const statistiques=useMemo(()=>({ total:tachesVisibles.length, aFaire:tachesVisibles.filter(t=>t.statut==="À faire").length, enCours:tachesVisibles.filter(t=>t.statut==="En cours").length, validation:tachesVisibles.filter(t=>t.statut==="En attente de validation").length, validees:tachesVisibles.filter(t=>t.statut==="Validée").length }),[tachesVisibles])

  const ouvrirCreation=()=>{ if(!peutCreerTache){ afficherToast("Vous n'avez pas l'autorisation de créer une tâche.","error"); return } setTacheSelectionnee(null); setFormulaire(FORMULAIRE_INITIAL); setModalOuverte(true); setMenuOuvert(null) }
  const ouvrirModification=(tache)=>{ if(!peutModifierTachePermission){ afficherToast("Vous n'avez pas l'autorisation de modifier une tâche.","error"); return } setTacheSelectionnee(tache); setFormulaire({titre:tache.titre,description:tache.description||"",executant:tache.executant,departement:tache.departement,priorite:tache.priorite,dateDebut:tache.dateDebut||"",dateEcheance:tache.dateEcheance||""}); setModalOuverte(true); setMenuOuvert(null) }
  const fermerModal=()=>{ setModalOuverte(false); setFormulaire(FORMULAIRE_INITIAL) }
  const modifierFormulaire=(e)=>{ const {name,value}=e.target; setFormulaire(a=>({...a,[name]:value})) }
  const enregistrerTache=(e)=>{
    e.preventDefault()
    if(tacheSelectionnee && !peutModifierTachePermission){ afficherToast("Vous n'avez pas l'autorisation de modifier cette tâche.","error"); return }
    if(!tacheSelectionnee && !peutCreerTache){ afficherToast("Vous n'avez pas l'autorisation de créer une tâche.","error"); return }
    if(!formulaire.titre.trim()||!formulaire.executant||!formulaire.departement||!formulaire.dateEcheance){ afficherToast("Veuillez remplir les champs obligatoires.","error"); return }
    if(tacheSelectionnee){
      setTaches(a=>a.map(t=>t.id===tacheSelectionnee.id?{...t,titre:formulaire.titre.trim(),description:formulaire.description.trim(),executant:formulaire.executant,departement:formulaire.departement,priorite:formulaire.priorite,dateDebut:formulaire.dateDebut,dateEcheance:formulaire.dateEcheance}:t))
      setTacheSelectionnee(a=>a?{...a,titre:formulaire.titre.trim(),description:formulaire.description.trim(),executant:formulaire.executant,departement:formulaire.departement,priorite:formulaire.priorite,dateDebut:formulaire.dateDebut,dateEcheance:formulaire.dateEcheance}:null)
      afficherToast("La tâche a été modifiée avec succès.")
    }else{
      const nouvelleTache={id:Date.now(),titre:formulaire.titre.trim(),description:formulaire.description.trim(),executant:formulaire.executant,departement:formulaire.departement,priorite:formulaire.priorite,statut:"À faire",progression:0,dateDebut:formulaire.dateDebut,dateEcheance:formulaire.dateEcheance,createur:nomUtilisateur,commentaires:[]}
      setTaches(a=>[nouvelleTache,...a]); afficherToast("La tâche a été créée avec succès.")
    }
    setModalOuverte(false); setFormulaire(FORMULAIRE_INITIAL)
  }
  const ouvrirDetails=(tache)=>{ setTacheSelectionnee(tache); setMenuOuvert(null); setNouveauCommentaire("") }
  const supprimerTache=(id)=>{ if(!peutSupprimerTachePermission){ afficherToast("Vous n'avez pas l'autorisation de supprimer une tâche.","error"); return } setTaches(a=>a.filter(t=>t.id!==id)); setTacheSelectionnee(null); afficherToast("La tâche a été supprimée.","success") }
  const changerStatutEmploye=(tache)=>{
    if(!estEmploye||!estMaTache(tache)){ afficherToast("Vous ne pouvez modifier que vos propres tâches.","error"); return }
    setTaches(a=>a.map(item=>{
      if(item.id!==tache.id) return item
      if(item.statut==="À faire"||item.statut==="Correction demandée") return {...item,statut:"En cours",progression:Math.max(item.progression,25)}
      if(item.statut==="En cours") return {...item,statut:"En attente de validation",progression:100}
      return item
    })); afficherToast("Le statut de la tâche a été mis à jour.","success")
  }
  const ajouterCommentaire=()=>{
    if(!tacheSelectionnee||!nouveauCommentaire.trim()) return
    const commentaire={id:Date.now(),auteur:nomUtilisateur,texte:nouveauCommentaire.trim(),date:new Date().toISOString().slice(0,10)}
    setTaches(a=>a.map(t=>t.id===tacheSelectionnee.id?{...t,commentaires:[...(t.commentaires||[]),commentaire]}:t))
    setTacheSelectionnee(a=>a?{...a,commentaires:[...(a.commentaires||[]),commentaire]}:null)
    setNouveauCommentaire(""); afficherToast("Commentaire ajouté.","success")
  }
  const demanderCorrection=(tache)=>{ setTaches(a=>a.map(i=>i.id===tache.id?{...i,statut:"Correction demandée",progression:Math.min(i.progression,70)}:i)); setTacheSelectionnee(a=>a?{...a,statut:"Correction demandée",progression:Math.min(a.progression,70)}:null); afficherToast("Une correction a été demandée.","error") }
  const validerTache=(tache)=>{ setTaches(a=>a.map(i=>i.id===tache.id?{...i,statut:"Validée",progression:100}:i)); setTacheSelectionnee(a=>a?{...a,statut:"Validée",progression:100}:null); afficherToast("La tâche a été validée.","success") }

  return (
    <div className="tasks-page">
      <div className="tasks-shell">
        <div className="tasks-header">
          <div className="tasks-header-left">
            <div className="tasks-icon-deco"><ClipboardList size={22}/></div>
            <div>
              <span className="tasks-kicker"><Sparkles size={12}/> {t("GESTION DES TÂCHES")}</span>
              <h1>{t("Tableau de bord des tâches")}</h1>
              <p className="tasks-subtitle">{t("Suivez et gérez les tâches de Groupe GAIN SARL")}</p>
            </div>
          </div>
          {peutCreerTache && <button type="button" className="primary-task-button" onClick={ouvrirCreation}><Plus size={17}/> {t("Nouvelle tâche")}</button>}
        </div>

        <div className="tasks-summary">
          <div className="summary-card"><div className="summary-icon blue"><FileStack size={18}/></div><span>{t("Total")}</span><strong>{statistiques.total}</strong></div>
          <div className="summary-card"><div className="summary-icon gray"><Inbox size={18}/></div><span>{t("À faire")}</span><strong>{statistiques.aFaire}</strong></div>
          <div className="summary-card"><div className="summary-icon light-blue"><Timer size={18}/></div><span>{t("En cours")}</span><strong>{statistiques.enCours}</strong></div>
          <div className="summary-card"><div className="summary-icon orange"><Layers size={18}/></div><span>{t("Validation")}</span><strong>{statistiques.validation}</strong></div>
          <div className="summary-card"><div className="summary-icon green"><CheckCircle2 size={18}/></div><span>{t("Validées")}</span><strong>{statistiques.validees}</strong></div>
        </div>

        <div className="tasks-toolbar">
          <div className="search-box"><Search size={16}/><input type="text" value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder={t("Rechercher une tâche...")}/></div>
          <div className="filters-box">
            <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}><option value="Tous">{t("Tous les statuts")}</option>{STATUTS.map(s=><option key={s} value={s}>{s}</option>)}</select>
            <select value={filtrePriorite} onChange={e=>setFiltrePriorite(e.target.value)}><option value="Toutes">{t("Toutes priorités")}</option>{PRIORITES.map(p=><option key={p} value={p}>{p}</option>)}</select>
            <select value={filtreDepartement} onChange={e=>setFiltreDepartement(e.target.value)}><option value="Tous">{t("Tous services")}</option>{DEPARTEMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select>
          </div>
        </div>

        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead><tr><th>{t("TÂCHE")}</th><th>{t("EXÉCUTANT")}</th><th>{t("SERVICE")}</th><th>{t("PRIORITÉ")}</th><th>{t("ÉCHÉANCE")}</th><th>{t("STATUT")}</th><th>{t("PROGRESSION")}</th><th>{t("ACTIONS")}</th></tr></thead>
            <tbody>
              {tachesAffichees.length===0?(
                <tr><td colSpan="8"><div className="empty-tasks"><div className="empty-icon"><ListChecks size={32}/></div><h3>{t("Aucune tâche trouvée")}</h3><p>{t("Modifiez vos critères de recherche ou de filtrage.")}</p></div></td></tr>
              ):(
                tachesAffichees.map(tache=>(
                  <tr key={tache.id}>
                    <td><div className="task-title-cell"><strong>{tache.titre}</strong><span>{tache.description||"Aucune description"}</span></div></td>
                    <td><div className="task-user-cell"><div className="task-avatar">{getInitiales(tache.executant)}</div><div><strong>{tache.executant}</strong><span>{t("Collaborateur")}</span></div></div></td>
                    <td>{tache.departement}</td>
                    <td><span className={`priority ${prioriteClasse(tache.priorite)}`}><Flag size={12}/>{t(tache.priorite)}</span></td>
                    <td><div className="task-date"><CalendarDays size={15}/>{formatDate(tache.dateEcheance)}</div></td>
                    <td><span className={`task-status ${statutClasse(tache.statut)}`}><StatutIcone statut={tache.statut}/>{t(tache.statut)}</span></td>
                    <td><div className="task-progress-cell"><div className="progress-top">{tache.progression}%</div><div className="progress-track"><div className="progress-value" style={{width:`${Math.min(100,Math.max(0,tache.progression))}%`}}/></div></div></td>
                    <td>
                      <div className="task-actions">
                        {estEmploye && estMaTache(tache) && peutTerminerTachePermission && (tache.statut==="À faire"||tache.statut==="Correction demandée"||tache.statut==="En cours") && (
                          <button type="button" className="icon-task-button" title={tache.statut==="En cours"?t("Terminer"):t("Démarrer")} onClick={()=>changerStatutEmploye(tache)}>{tache.statut==="En cours"?<CheckCircle2 size={17}/>:<Clock3 size={17}/>}</button>
                        )}
                        <button type="button" className="icon-task-button" onClick={()=>ouvrirDetails(tache)}><Search size={17}/></button>
                        {peutModifierTache() && <button type="button" className="icon-task-button" onClick={()=>ouvrirModification(tache)}><Pencil size={17}/></button>}
                        {peutSupprimerTachePermission && <button type="button" className="icon-task-button danger" onClick={()=>supprimerTache(tache.id)}><Trash2 size={17}/></button>}
                        <div className="task-menu-wrapper">
                          <button type="button" className="icon-task-button" onClick={()=>setMenuOuvert(menuOuvert===tache.id?null:tache.id)}><MoreHorizontal size={17}/></button>
                          {menuOuvert===tache.id && (
                            <div className="task-actions-menu">
                              <button type="button" onClick={()=>ouvrirDetails(tache)}><Search size={15}/> {t("Voir les détails")}</button>
                              {peutModifierTache() && <button type="button" onClick={()=>ouvrirModification(tache)}><Pencil size={15}/> {t("Modifier")}</button>}
                              {peutSupprimerTachePermission && <button type="button" className="danger" onClick={()=>supprimerTache(tache.id)}><Trash2 size={15}/> {t("Supprimer")}</button>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="tasks-pagination">
          <div className="pagination-info"><span>{t("Affichage de")} <strong>{tachesAffichees.length}</strong> {t("tâche(s) sur")} <strong>{tachesFiltrees.length}</strong></span></div>
          <div className="pagination-controls">
            <button type="button" className="pagination-button" disabled={pageActuelle<=1} onClick={()=>setPage(a=>Math.max(1,a-1))}><ChevronLeft size={16}/></button>
            <span className="pagination-current">{pageActuelle}</span><span className="pagination-separator">/</span><span className="pagination-total">{totalPages}</span>
            <button type="button" className="pagination-button" disabled={pageActuelle>=totalPages} onClick={()=>setPage(a=>Math.min(totalPages,a+1))}><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {modalOuverte && (
        <div className="task-modal-overlay" onMouseDown={fermerModal}>
          <div className="task-modal" onMouseDown={e=>e.stopPropagation()}>
            <div className="task-modal-header"><div><span className="modal-kicker">{tacheSelectionnee?t("MODIFICATION"):t("NOUVELLE TÂCHE")}</span><h2>{tacheSelectionnee?t("Modifier la tâche"):t("Créer une tâche")}</h2><p>{tacheSelectionnee?t("Mettez à jour les informations de la tâche."):t("Créez une nouvelle tâche et attribuez-la à un collaborateur.")}</p></div><button type="button" className="modal-close" onClick={fermerModal}><X size={20}/></button></div>
            <form onSubmit={enregistrerTache}>
              <div className="task-modal-body">
                <div className="form-group full"><label>{t("Titre de la tâche")}</label><input name="titre" type="text" value={formulaire.titre} onChange={modifierFormulaire} placeholder={t("Ex. Préparer le rapport mensuel")} required/></div>
                <div className="form-group full"><label>{t("Description")}</label><textarea name="description" value={formulaire.description} onChange={modifierFormulaire} placeholder={t("Décrivez le travail à réaliser...")} rows={4}/></div>
                <div className="form-grid">
                  <div className="form-group"><label>{t("Exécutant")}</label><select name="executant" value={formulaire.executant} onChange={modifierFormulaire} required><option value="">{t("Sélectionner un collaborateur")}</option>{EMPLOYES.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
                  <div className="form-group"><label>{t("Service")}</label><select name="departement" value={formulaire.departement} onChange={modifierFormulaire} required><option value="">{t("Sélectionner un service")}</option>{DEPARTEMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  <div className="form-group"><label>{t("Priorité")}</label><select name="priorite" value={formulaire.priorite} onChange={modifierFormulaire}>{PRIORITES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>{t("Date de début")}</label><input name="dateDebut" type="date" value={formulaire.dateDebut} onChange={modifierFormulaire}/></div>
                  <div className="form-group"><label>{t("Date d'échéance")}</label><input name="dateEcheance" type="date" value={formulaire.dateEcheance} onChange={modifierFormulaire} required/></div>
                </div>
              </div>
              <div className="task-modal-footer"><button type="button" className="secondary-task-button" onClick={fermerModal}>{t("Annuler")}</button><button type="submit" className="primary-task-button"><Check size={17}/>{tacheSelectionnee?t("Enregistrer"):t("Créer la tâche")}</button></div>
            </form>
          </div>
        </div>
      )}

      {tacheSelectionnee && !modalOuverte && (
        <div className="task-modal-overlay" onMouseDown={()=>{setTacheSelectionnee(null); setNouveauCommentaire("")}}>
          <div className="task-modal xlarge" onMouseDown={e=>e.stopPropagation()}>
            <div className="task-modal-header"><div><span className="modal-kicker">{t("DÉTAILS DE LA TÂCHE")}</span><h2>{tacheSelectionnee.titre}</h2><p>{t("Créée par")} {tacheSelectionnee.createur}</p></div><button type="button" className="modal-close" onClick={()=>{setTacheSelectionnee(null); setNouveauCommentaire("")}}><X size={20}/></button></div>
            <div className="task-detail-body">
              <main className="task-detail-main">
                <div className="task-detail-badges"><span className={`task-status ${statutClasse(tacheSelectionnee.statut)}`}><StatutIcone statut={tacheSelectionnee.statut}/>{t(tacheSelectionnee.statut)}</span><span className={`priority ${prioriteClasse(tacheSelectionnee.priorite)}`}><Flag size={12}/>{t(tacheSelectionnee.priorite)}</span></div>
                <section className="detail-section"><h3>{t("Description")}</h3><p className="description-text">{tacheSelectionnee.description||t("Aucune description renseignée.")}</p></section>
                <section className="detail-section"><div className="detail-section-title"><strong>{t("Progression")}</strong><strong>{tacheSelectionnee.progression}%</strong></div><div className="detail-progress"><div style={{width:`${tacheSelectionnee.progression}%`}}/></div></section>
                {tacheSelectionnee.statut==="En attente de validation" && peutValiderTachePermission && (
                  <div className="report-card"><div className="report-card-header"><div><CheckCircle2 size={18}/><strong>{t("Travail terminé")}</strong></div><span>{t("À vérifier")}</span></div><div className="report-content"><p>{t("L'exécutant a déclaré cette tâche terminée. Vérifiez le travail avant de procéder à la validation.")}</p><div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}><button type="button" className="secondary-task-button" onClick={()=>demanderCorrection(tacheSelectionnee)}><RotateCcw size={15}/> {t("Demander une correction")}</button><button type="button" className="primary-task-button" onClick={()=>validerTache(tacheSelectionnee)}><Check size={15}/> {t("Valider la tâche")}</button></div></div></div>
                )}
                <section className="discussion-section">
                  <div className="discussion-header"><div><MessageCircle size={17}/><h3>{t("Discussion")}</h3></div><span>{(tacheSelectionnee.commentaires||[]).length} {t("commentaire(s)")}</span></div>
                  <div className="messages-list">
                    {tacheSelectionnee.commentaires?.length?(
                      tacheSelectionnee.commentaires.map(c=>(
                        <div className="task-message" key={c.id}><div className="task-avatar">{getInitiales(c.auteur)}</div><div><div className="message-meta"><strong>{c.auteur}</strong><small>{formatDate(c.date)}</small></div><p>{c.texte}</p></div></div>
                      ))
                    ):(
                      <div className="empty-messages">{t("Aucun commentaire pour le moment.")}<p>{t("Utilisez le champ ci-dessous pour démarrer la discussion.")}</p></div>
                    )}
                  </div>
                  <div className="message-composer"><input type="text" value={nouveauCommentaire} onChange={e=>setNouveauCommentaire(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") ajouterCommentaire()}} placeholder={t("Écrire un commentaire...")}/><button type="button" onClick={ajouterCommentaire}><MessageCircle size={17}/></button></div>
                </section>
              </main>
              <aside className="task-detail-sidebar">
                <div className="detail-person"><div className="task-avatar large">{getInitiales(tacheSelectionnee.executant)}</div><strong>{tacheSelectionnee.executant}</strong><span>{tacheSelectionnee.departement}</span></div>
                <div className="detail-info-list">
                  <div><User size={16}/><span><small>{t("Exécutant")}</small><strong>{tacheSelectionnee.executant}</strong></span></div>
                  <div><Users size={16}/><span><small>{t("Service")}</small><strong>{tacheSelectionnee.departement}</strong></span></div>
                  <div><User size={16}/><span><small>{t("Créée par")}</small><strong>{tacheSelectionnee.createur}</strong></span></div>
                  <div><CalendarDays size={16}/><span><small>{t("Date de début")}</small><strong>{formatDate(tacheSelectionnee.dateDebut)}</strong></span></div>
                  <div><CalendarDays size={16}/><span><small>{t("Échéance")}</small><strong>{formatDate(tacheSelectionnee.dateEcheance)}</strong></span></div>
                  <div><Flag size={16}/><span><small>{t("Priorité")}</small><strong>{tacheSelectionnee.priorite}</strong></span></div>
                </div>
                {estEmploye && estMaTache(tacheSelectionnee) && (tacheSelectionnee.statut==="À faire"||tacheSelectionnee.statut==="En cours"||tacheSelectionnee.statut==="Correction demandée") && (
                  <button type="button" className="primary-task-button" style={{width:"100%"}} onClick={()=>changerStatutEmploye(tacheSelectionnee)}>{tacheSelectionnee.statut==="En cours"?<><Check size={16}/> {t("Déclarer terminée")}</>:<><Clock3 size={16}/> {t("Commencer la tâche")}</>}</button>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {toast && (<div className={`task-toast ${toast.type}`}><CheckCircle2 size={17}/><span>{t(toast.message)}</span><button type="button" onClick={()=>setToast(null)}><X size={15}/></button></div>)}
    </div>
  )
}
