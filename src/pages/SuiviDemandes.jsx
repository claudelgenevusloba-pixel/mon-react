import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

import {
  Search,
  Filter,
  Eye,
  X,
} from "lucide-react";

import "../styles/pages/suivi-demandes.css";

import api from "../config/apiClient";
import { useLanguage } from "../context/LanguageContext";
import { formaterDateSelonPreference } from "../context/LanguageContext";

function libelleType(demande) {
  return (
    demande?.type_libelle ||
    demande?.typeLibelle ||
    demande?.type_demande ||
    "—"
  );
}

function libelleStatut(demande) {
  return (
    demande?.statut_libelle ||
    demande?.statutLibelle ||
    demande?.statut ||
    "—"
  );
}

function nomDemandeur(demande) {
  const d = demande?.demandeur;
  if (!d) return "—";
  return (
    `${d.prenom || ""} ${d.nom || ""}`.trim() ||
    d.nom ||
    d.prenom ||
    "—"
  );
}

function formaterDate(valeur) {
  if (!valeur) return "—";
  try {
    return formaterDateSelonPreference(valeur);
  } catch {
    return String(valeur);
  }
}

export default function SuiviDemandes() {
  const { t } = useLanguage();
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [reinitialiserPagination, setReinitialiserPagination] =
    useState(false);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      setChargement(true);
      setErreur("");

      try {
        const response = await api.get("/demandes");
        const data = response.data || {};
        const liste =
          data.demandes ||
          data.data ||
          data.resultats ||
          [];

        if (actif) {
          setDonnees(
            Array.isArray(liste)
              ? liste.map((demande, index) => ({
                  ...demande,
                  _rowKey:
                    demande?.id_demande ??
                    demande?.id ??
                    `demande-${index}`,
                }))
              : []
          );
        }
      } catch (error) {
        if (actif) {
          setErreur(
            error?.response?.data?.message ||
              "Impossible de charger le suivi des demandes."
          );
        }
      } finally {
        if (actif) setChargement(false);
      }
    };

    charger();

    return () => {
      actif = false;
    };
  }, []);

  const typesDisponibles = useMemo(() => {
    const set = new Set();
    donnees.forEach((demande) => {
      if (demande?.type_demande) {
        set.add(demande.type_demande);
      }
    });
    return Array.from(set);
  }, [donnees]);

  const statutsDisponibles = useMemo(() => {
    const set = new Set();
    donnees.forEach((demande) => {
      if (demande?.statut) {
        set.add(demande.statut);
      }
    });
    return Array.from(set);
  }, [donnees]);

  const colonnes = useMemo(
    () => [
      {
        id: "id_demande",
        name: "ID",
        selector: (ligne) => ligne.id_demande ?? ligne.id,
        sortable: true,
        width: "90px",
      },
      {
        id: "type",
        name: t("Type"),
        selector: libelleType,
        sortable: true,
      },
      {
        id: "objet",
        name: t("Objet"),
        selector: (ligne) => ligne.objet || "—",
        sortable: true,
        grow: 1.5,
      },
      {
        id: "demandeur",
        name: t("Demandeur"),
        selector: nomDemandeur,
        sortable: true,
      },
      {
        id: "statut",
        name: t("Statut"),
        selector: libelleStatut,
        sortable: true,
      },
      {
        id: "date_demande",
        name: t("Date"),
        selector: (ligne) => ligne.date_demande || "",
        format: (ligne) => formaterDate(ligne.date_demande),
        sortable: true,
      },
    ],
    [t]
  );

  const valeurCellule = (ligne, cle) => {
    switch (cle) {
      case "type":
        return libelleType(ligne);
      case "objet":
        return ligne?.objet || "—";
      case "demandeur":
        return nomDemandeur(ligne);
      case "statut":
        return libelleStatut(ligne);
      case "id_demande":
        return ligne?.id_demande ?? ligne?.id ?? "";
      case "date_demande":
        return formaterDate(ligne?.date_demande);
      default:
        return ligne?.[cle] ?? "";
    }
  };

  const donneesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    let resultat = donnees.filter((ligne) => {
      if (
        filtreType !== "tous" &&
        ligne?.type_demande !== filtreType
      ) {
        return false;
      }

      if (
        filtreStatut !== "tous" &&
        ligne?.statut !== filtreStatut
      ) {
        return false;
      }

      if (!terme) return true;

      return colonnes.some((colonne) =>
        String(valeurCellule(ligne, colonne.id))
          .toLowerCase()
          .includes(terme)
      );
    });

    return resultat;
  }, [donnees, recherche, filtreType, filtreStatut, colonnes]);

  const colonnesTableau = useMemo(
    () => [
      ...colonnes,
      {
        id: "actions",
        name: t("Actions"),
        button: true,
        ignoreRowClick: true,
        allowOverflow: true,
        cell: (ligne) => (
          <button
            type="button"
            className="suivi-demandes-action"
            onClick={() => setSelection(ligne)}
            aria-label={`${t("Voir le détail de la demande")} ${ligne.id_demande ?? ligne.id ?? ""}`}
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [colonnes, t]
  );

  const stylesTableau = useMemo(
    () => ({
      tableWrapper: {
        style: { borderRadius: "0.75rem" },
      },
      headRow: {
        style: {
          minHeight: "48px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        },
      },
      headCells: {
        style: {
          color: "#374151",
          fontSize: "0.9rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        },
      },
      rows: {
        style: { minHeight: "56px", fontSize: "0.9rem" },
        highlightOnHoverStyle: { backgroundColor: "#f3f4f6" },
      },
      cells: {
        style: {
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
        },
      },
      pagination: {
        style: {
          borderTop: "1px solid #e5e7eb",
          color: "#374151",
        },
      },
    }),
    []
  );

  const reinitialiserPage = () => {
    setReinitialiserPagination((precedent) => !precedent);
  };

  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreType("tous");
    setFiltreStatut("tous");
    reinitialiserPage();
  };

  return (
    <div className="suivi-demandes-page">
      <div className="suivi-demandes-header">
        <div>
          <h1>{t("Suivi des demandes")}</h1>
          <p>
            {t("Tableau de suivi des demandes avec recherche, filtres, tri et pagination.")}
          </p>
        </div>
      </div>

      <div className="suivi-demandes-toolbar">
        <div className="suivi-demandes-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t("Rechercher une demande...")}
            value={recherche}
            onChange={(event) => {
              setRecherche(event.target.value);
                reinitialiserPage();
            }}
          />
        </div>

        <div className="suivi-demandes-filters">
          <div className="suivi-demandes-filter">
            <Filter size={16} />
            <select
              value={filtreType}
              onChange={(event) => {
                setFiltreType(event.target.value);
                reinitialiserPage();
              }}
            >
              <option value="tous">
                {t("Tous les types")}
              </option>
              {typesDisponibles.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="suivi-demandes-filter">
            <Filter size={16} />
            <select
              value={filtreStatut}
              onChange={(event) => {
                setFiltreStatut(event.target.value);
                reinitialiserPage();
              }}
            >
              <option value="tous">
                {t("Tous les statuts")}
              </option>
              {statutsDisponibles.map((statut) => (
                <option key={statut} value={statut}>
                  {statut.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="suivi-demandes-reset"
            onClick={reinitialiserFiltres}
          >
            {t("Réinitialiser")}
          </button>
        </div>
      </div>

      {chargement && (
        <div className="suivi-demandes-state">
          {t("Chargement du suivi des demandes...")}
        </div>
      )}

      {!chargement && erreur && (
        <div className="suivi-demandes-state error">
          {erreur}
        </div>
      )}

      {!chargement && !erreur && (
        <div className="suivi-demandes-table-wrapper">
          <DataTable
            columns={colonnesTableau}
            data={donneesFiltrees}
            keyField="_rowKey"
            defaultSortFieldId="id_demande"
            defaultSortAsc={false}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50]}
            paginationResetDefaultPage={reinitialiserPagination}
            paginationComponentOptions={{
              rowsPerPageText: t("Demandes par page"),
              rangeSeparatorText: t("sur"),
              noRowsPerPage: false,
              selectAllRowsItem: false,
            }}
            highlightOnHover
            striped
            responsive
            customStyles={stylesTableau}
            noDataComponent={t("Aucune demande disponible.")}
          />
        </div>
      )}

      {selection && (
        <div
          className="suivi-demandes-modal-overlay"
          onClick={() => setSelection(null)}
        >
          <div
            className="suivi-demandes-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="suivi-demandes-modal-header">
              <h2>{t("Détail de la demande")}</h2>
              <button
                type="button"
                onClick={() => setSelection(null)}
                aria-label={t("Fermer")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="suivi-demandes-modal-body">
              <div className="suivi-demandes-detail-grid">
                <div>
                  <span>{t("ID")}</span>
                  <strong>
                    {selection.id_demande}
                  </strong>
                </div>

                <div>
                  <span>{t("Type")}</span>
                  <strong>
                    {libelleType(selection)}
                  </strong>
                </div>

                <div>
                  <span>{t("Statut")}</span>
                  <strong>
                    {libelleStatut(selection)}
                  </strong>
                </div>

                <div>
                  <span>{t("Demandeur")}</span>
                  <strong>
                    {nomDemandeur(selection)}
                  </strong>
                </div>

                <div>
                  <span>{t("Date")}</span>
                  <strong>
                    {formaterDate(
                      selection.date_demande
                    )}
                  </strong>
                </div>

                <div>
                  <span>{t("Traiteur")}</span>
                  <strong>
                    {selection.traiteur
                      ? `${selection.traiteur.prenom || ""} ${selection.traiteur.nom || ""}`.trim()
                      : "—"}
                  </strong>
                </div>
              </div>

              {selection.objet && (
                <div className="suivi-demandes-detail-block">
                  <span>{t("Objet")}</span>
                  <p>{selection.objet}</p>
                </div>
              )}

              {selection.description && (
                <div className="suivi-demandes-detail-block">
                  <span>{t("Description")}</span>
                  <p>{selection.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
