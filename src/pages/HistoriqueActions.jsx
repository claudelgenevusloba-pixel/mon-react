import { useEffect, useMemo, useState } from "react";
import { Activity, RefreshCw, Search } from "lucide-react";
import { AppDataTable, PageHeader } from "../components/common";
import { historiqueService } from "../services/historiqueService";
import {
  formaterDateSelonPreference,
  useLanguage,
} from "../context/LanguageContext";
import "../styles/pages/historique-actions.css";

export default function HistoriqueActions() {
  const { t } = useLanguage();
  const [elements, setElements] = useState([]);
  const [module, setModule] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const charger = async () => {
    setChargement(true);
    setErreur("");
    try {
      const data = await historiqueService.lister({
        limit: 200,
        module: module || undefined,
      });
      setElements(Array.isArray(data.historique) ? data.historique : []);
    } catch (error) {
      setErreur(error?.response?.data?.message || t("Impossible de charger l'historique."));
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, [module]);

  const modules = ["demandes", "taches", "rapports_taches", "employes", "auth"];
  const resultat = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return elements;
    return elements.filter((element) => [
      element.action,
      element.module,
      element.description,
      element.utilisateur?.nom,
      element.utilisateur?.prenom,
    ].some((valeur) => String(valeur || "").toLowerCase().includes(terme)));
  }, [elements, recherche]);

  const colonnes = useMemo(() => [
    {
      id: "created_at",
      name: t("Date et heure"),
      selector: (row) => row.created_at ? new Date(row.created_at).getTime() : 0,
      format: (row) => row.created_at
        ? `${formaterDateSelonPreference(row.created_at)} ${new Date(row.created_at).toLocaleTimeString(document.documentElement.lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}`
        : "—",
      sortable: true,
      width: "190px",
    },
    {
      id: "utilisateur",
      name: t("Utilisateur"),
      selector: (row) => [row.utilisateur?.prenom, row.utilisateur?.nom].filter(Boolean).join(" ") || t("Utilisateur supprimé"),
      sortable: true,
      minWidth: "180px",
    },
    {
      id: "action",
      name: t("Action"),
      selector: (row) => t(row.action || "Action"),
      sortable: true,
      minWidth: "160px",
    },
    {
      id: "module",
      name: t("Module"),
      selector: (row) => t(row.module || "—"),
      sortable: true,
      minWidth: "140px",
    },
    {
      id: "description",
      name: t("Détail"),
      selector: (row) => row.description || "—",
      sortable: true,
      wrap: true,
      grow: 2,
    },
  ], [t]);

  return (
    <section className="history-page">
      <PageHeader
        className="history-heading"
        eyebrow="GAIN OFFICE"
        eyebrowClassName="history-eyebrow"
        title={
          <>
            <Activity size={24} aria-hidden="true" />
            {t("Historique des actions")}
          </>
        }
        description={t("Consultez les actions récentes enregistrées dans l'application.")}
        actions={
          <button
            type="button"
            className="history-refresh"
            onClick={charger}
            disabled={chargement}
          >
            <RefreshCw size={16} /> {t("Actualiser")}
          </button>
        }
      />

      <div className="history-filters">
        <label className="history-search">
          <Search size={17} />
          <input value={recherche} onChange={(event) => setRecherche(event.target.value)} placeholder={t("Rechercher dans l'historique...")} />
        </label>
        <select value={module} onChange={(event) => setModule(event.target.value)} aria-label={t("Filtrer par module")}>
          <option value="">{t("Tous les modules")}</option>
          {modules.map((valeur) => <option key={valeur} value={valeur}>{t(valeur)}</option>)}
        </select>
      </div>

      {erreur && <div className="history-error">{t(erreur)}</div>}

      <div className="history-table-wrap">
        <AppDataTable
          columns={colonnes}
          data={resultat}
          keyField="id_historique"
          defaultSortFieldId="created_at"
          defaultSortAsc={false}
          paginationComponentOptions={{
            rowsPerPageText: t("Actions par page"),
            rangeSeparatorText: t("sur"),
          }}
          progressPending={chargement}
          progressComponent={<div className="history-empty">{t("Chargement de l'historique...")}</div>}
          noDataMessage={t("Aucune action enregistrée.")}
        />
      </div>
      <div className="history-result-count">{resultat.length} {t("action(s)")}</div>
    </section>
  );
}
