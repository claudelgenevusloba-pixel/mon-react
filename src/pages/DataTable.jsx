import { useEffect, useMemo, useState } from "react";

import { Search } from "lucide-react";

import "../styles/pages/employes.css";

import api from "../config/apiClient";

export default function DataTable() {
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState({ colonne: "id_employe", sens: "desc" });
  const [page, setPage] = useState(1);
  const parPage = 10;

  useEffect(() => {
    let actif = true;

    const charger = async () => {
      setChargement(true);
      setErreur("");

      try {
        const response = await api.get("/employes");
        const data = response.data || {};
        const liste =
          data.employes ||
          data.data ||
          data.resultats ||
          [];

        if (actif) {
          setDonnees(Array.isArray(liste) ? liste : []);
        }
      } catch (error) {
        if (actif) {
          setErreur(
            error?.response?.data?.message ||
              "Impossible de charger les données."
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

  const colonnes = [
    { cle: "id_employe", libelle: "ID" },
    { cle: "matricule", libelle: "Matricule" },
    { cle: "nom", libelle: "Nom" },
    { cle: "prenom", libelle: "Prénom" },
    { cle: "email", libelle: "E-mail" },
    { cle: "statut", libelle: "Statut" },
  ];

  const valeurCellule = (ligne, cle) => {
    if (cle === "nom") return ligne?.utilisateur?.nom || "";
    if (cle === "prenom") return ligne?.utilisateur?.prenom || "";
    if (cle === "email") return ligne?.utilisateur?.email || "";
    if (cle === "statut") return ligne?.utilisateur?.statut || "";
    return ligne?.[cle] ?? "";
  };

  const donneesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    const filtres = terme
      ? donnees.filter((ligne) =>
          colonnes.some((colonne) =>
            String(valeurCellule(ligne, colonne.cle))
              .toLowerCase()
              .includes(terme)
          )
        )
      : donnees;

    const triees = [...filtres].sort((a, b) => {
      const va = valeurCellule(a, tri.colonne);
      const vb = valeurCellule(b, tri.colonne);

      if (va < vb) return tri.sens === "asc" ? -1 : 1;
      if (va > vb) return tri.sens === "asc" ? 1 : -1;
      return 0;
    });

    return triees;
  }, [donnees, recherche, tri]);

  const totalPages = Math.max(
    1,
    Math.ceil(donneesFiltrees.length / parPage)
  );

  const pageActuelle = Math.min(page, totalPages);

  const pageDonnees = donneesFiltrees.slice(
    (pageActuelle - 1) * parPage,
    pageActuelle * parPage
  );

  const changerTri = (colonne) => {
    setTri((precedent) => {
      if (precedent.colonne === colonne) {
        return {
          colonne,
          sens: precedent.sens === "asc" ? "desc" : "asc",
        };
      }

      return { colonne, sens: "asc" };
    });

    setPage(1);
  };

  return (
    <div className="employes-page">
      <div className="employes-header">
        <div>
          <h1>Tableau de données</h1>
          <p>
            Consultation tabulaire des employés avec
            recherche, tri et pagination.
          </p>
        </div>
      </div>

      <div className="employes-toolbar">
        <div className="employes-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(event) => {
              setRecherche(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {chargement && (
        <div className="employes-state">
          Chargement des données...
        </div>
      )}

      {!chargement && erreur && (
        <div className="employes-state error">
          {erreur}
        </div>
      )}

      {!chargement && !erreur && (
        <div className="employes-table-wrapper">
          <table className="employes-table">
            <thead>
              <tr>
                {colonnes.map((colonne) => (
                  <th
                    key={colonne.cle}
                    onClick={() =>
                      changerTri(colonne.cle)
                    }
                  >
                    {colonne.libelle}
                    {tri.colonne === colonne.cle
                      ? tri.sens === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageDonnees.length === 0 ? (
                <tr>
                  <td colSpan={colonnes.length}>
                    Aucune donnée disponible.
                  </td>
                </tr>
              ) : (
                pageDonnees.map((ligne, index) => (
                  <tr key={ligne.id_employe || index}>
                    {colonnes.map((colonne) => (
                      <td key={colonne.cle}>
                        {String(
                          valeurCellule(ligne, colonne.cle)
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!chargement && !erreur && totalPages > 1 && (
        <div className="employes-pagination">
          <button
            type="button"
            disabled={pageActuelle <= 1}
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
          >
            Précédent
          </button>

          <span>
            Page {pageActuelle} / {totalPages}
          </span>

          <button
            type="button"
            disabled={pageActuelle >= totalPages}
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
