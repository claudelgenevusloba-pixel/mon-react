import { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock3,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import "./Rapports.css";

import { PERMISSIONS } from "../config/permissions";
import {
  aPermission,
  getRole,
} from "../config/access";
import { ROLES } from "../config/roles";

import { API_URL } from "../config/api";

function Rapports({ utilisateur }) {

  const [rapports, setRapports] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [rapportSelectionne, setRapportSelectionne] =
    useState(null);

  /*
   * Nouveau rapport périodique (autonome ou lié à une tâche).
   */
  const [modalNouveau, setModalNouveau] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [formulaire, setFormulaire] = useState({
    travail_effectue: "",
    difficultes: "",
    commentaire: "",
    date_debut_periode: "",
    date_fin_periode: "",
  });

  /*
   * Décision du supérieur (motif obligatoire pour
   * la correction et le rejet).
   */
  const [motif, setMotif] = useState("");
  const [enCoursDecision, setEnCoursDecision] =
    useState(false);

  /*
   * =====================================================
   * CONTEXTE UTILISATEUR
   * =====================================================
   */

  const role = getRole(utilisateur);

  const peutVoirRapports = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_RAPPORTS
  );

  const peutCreerRapport = aPermission(
    utilisateur,
    PERMISSIONS.CREER_RAPPORT
  );

  const peutModifierRapport = aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_RAPPORT
  );

  const peutSupprimerRapport = aPermission(
    utilisateur,
    PERMISSIONS.SUPPRIMER_RAPPORT
  );

  const peutValiderRapport = aPermission(
    utilisateur,
    PERMISSIONS.VALIDER_RAPPORT
  );

  const peutControlerRapport = aPermission(
    utilisateur,
    PERMISSIONS.CONTROLER_RAPPORT
  );

  /*
   * Règle métier :
   * Le Directeur consulte / valide / contrôle.
   * Il ne produit pas de rapport.
   */
  const peutProduireRapport =
    peutCreerRapport &&
    role !== ROLES.DIRECTEUR;

  /*
   * =====================================================
   * CHARGEMENT DES RAPPORTS
   * =====================================================
   */

  const chargerRapports = async () => {

    const token =
      localStorage.getItem("gain_office_token") ||
      localStorage.getItem("token");

    if (!token) {
      setErreur("Session utilisateur introuvable.");
      setChargement(false);
      return;
    }

    if (!peutVoirRapports) {
      setRapports([]);
      setErreur(
        "Vous n'avez pas l'autorisation de consulter les rapports."
      );
      setChargement(false);
      return;
    }

    setChargement(true);
    setErreur("");

    try {

      const response = await fetch(
        `${API_URL}/rapports-taches`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Impossible de récupérer les rapports."
        );
      }

      const liste =
        data.rapports ||
        data.data ||
        data.resultats ||
        [];

      setRapports(
        Array.isArray(liste)
          ? liste
          : []
      );

    } catch (error) {

      console.error(error);

      setErreur(
        error.message ||
          "Erreur lors du chargement des rapports."
      );

    } finally {

      setChargement(false);
    }
  };

  useEffect(() => {
    chargerRapports();
  }, [peutVoirRapports]);

  /* ============================================================
     HELPER API
  ============================================================ */

  const api = async (endpoint, options = {}) => {
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const accessToken =
      localStorage.getItem("gain_office_token") ||
      localStorage.getItem("token") ||
      "";

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      { ...options, headers }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Erreur de communication avec le serveur."
      );
    }

    return data;
  };

  /* ============================================================
     SOUMISSION D'UN RAPPORT PÉRIODIQUE
     ----------------------------------------------------------
     Rapport autonome (période + contenu) — le destinataire
     (supérieur hiérarchique direct) est calculé par Laravel.
  ============================================================ */

  const soumettreRapport = async (event) => {
    event.preventDefault();

    if (!formulaire.travail_effectue.trim()) {
      return;
    }

    setEnvoi(true);

    try {
      await api("/rapports-taches", {
        method: "POST",
        body: JSON.stringify({
          travail_effectue:
            formulaire.travail_effectue.trim(),

          difficultes:
            formulaire.difficultes.trim() || null,

          commentaire:
            formulaire.commentaire.trim() || null,

          date_debut_periode:
            formulaire.date_debut_periode || null,

          date_fin_periode:
            formulaire.date_fin_periode || null,
        }),
      });

      setModalNouveau(false);

      setFormulaire({
        travail_effectue: "",
        difficultes: "",
        commentaire: "",
        date_debut_periode: "",
        date_fin_periode: "",
      });

      await chargerRapports();
    } catch (error) {
      console.error(error);
      setErreur(
        error.message || "Impossible de soumettre le rapport."
      );
    } finally {
      setEnvoi(false);
    }
  };

  /* ============================================================
     DÉCISION DU SUPÉRIEUR
     ----------------------------------------------------------
     Valider / Corriger (motif) / Refuser (motif) — Laravel
     vérifie la permission et le périmètre côté serveur.
  ============================================================ */

  const deciderRapport = async (nouveauStatut) => {
    if (!rapportSelectionne) {
      return;
    }

    if (
      ["correction_demandee", "rejete"].includes(
        nouveauStatut
      ) &&
      !motif.trim()
    ) {
      setErreur("Le motif est obligatoire.");
      return;
    }

    setEnCoursDecision(true);
    setErreur("");

    try {
      await api(
        `/rapports-taches/${rapportSelectionne.id_rapport}`,
        {
          method: "PUT",
          body: JSON.stringify({
            statut: nouveauStatut,
            motif: motif.trim() || null,
          }),
        }
      );

      setMotif("");
      setRapportSelectionne(null);

      await chargerRapports();
    } catch (error) {
      console.error(error);
      setErreur(
        error.message || "Impossible d'enregistrer la décision."
      );
    } finally {
      setEnCoursDecision(false);
    }
  };

  /*
   * =====================================================
   * OUTILS
   * =====================================================
   */

  const obtenirStatut = (rapport) => {
    return String(
      rapport.statut ||
        rapport.status ||
        rapport.etat ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  const obtenirTitre = (rapport) => {
    return (
      rapport.titre ||
      rapport.libelle ||
      rapport.objet ||
      rapport.nom ||
      `Rapport #${
        rapport.id_rapport ||
        rapport.id ||
        ""
      }`
    );
  };

  const obtenirDescription = (rapport) => {
    return (
      rapport.description ||
      rapport.commentaire ||
      rapport.contenu ||
      "Aucune description disponible."
    );
  };

  const obtenirEmploye = (rapport) => {

    if (rapport.employe) {
      return `${rapport.employe.prenom || ""} ${
        rapport.employe.nom || ""
      }`.trim();
    }

    if (rapport.utilisateur) {
      return `${rapport.utilisateur.prenom || ""} ${
        rapport.utilisateur.nom || ""
      }`.trim();
    }

    return (
      rapport.nom_employe ||
      rapport.employe_nom ||
      "Non renseigné"
    );
  };
    const obtenirDate = (rapport) => {

    const date =
      rapport.created_at ||
      rapport.date_rapport ||
      rapport.date_creation;

    if (!date) {
      return "—";
    }

    const valeur = new Date(date);

    if (Number.isNaN(valeur.getTime())) {
      return String(date);
    }

    return valeur.toLocaleDateString("fr-FR");
  };

  /*
   * =====================================================
   * RECHERCHE
   * =====================================================
   */

  const rapportsFiltres = useMemo(() => {

    const terme =
      recherche.trim().toLowerCase();

    if (!terme) {
      return rapports;
    }

    return rapports.filter((rapport) => {

      const contenu = [
        obtenirTitre(rapport),
        obtenirDescription(rapport),
        obtenirEmploye(rapport),
        rapport.statut,
        rapport.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenu.includes(terme);
    });

  }, [rapports, recherche]);

  /*
   * =====================================================
   * STATISTIQUES
   * =====================================================
   */

  const total = rapports.length;

  /*
   * Statuts réels du backend :
   * soumis, en_cours_examen, valide, correction_demandee, rejete
   */
  const termines = rapports.filter((rapport) => {
    const statut = obtenirStatut(rapport);

    return [
      "valide",
      "validé",
      "validee",
      "validée",
      "rejete",
      "refusé",
      "termine",
      "terminé",
      "terminee",
      "terminée",
    ].includes(statut);
  }).length;

  const enCours = rapports.filter((rapport) => {
    const statut = obtenirStatut(rapport);

    return [
      "en_cours_examen",
      "en_cours",
      "en cours",
      "encours",
    ].includes(statut);
  }).length;

  const enAttente =
    Math.max(
      total - termines - enCours,
      0
    );

  /*
   * =====================================================
   * AFFICHAGE DU STATUT
   * =====================================================
   */

  const afficherStatut = (rapport) => {
    const statut = obtenirStatut(rapport);

    if (
      [
        "valide",
        "validé",
        "validee",
        "validée",
      ].includes(statut)
    ) {
      return (
        <span className="rapport-status status-success">
          <CheckCircle2 size={14} />
          Validé
        </span>
      );
    }

    if (
      ["rejete", "refusé", "rejeté"].includes(statut)
    ) {
      return (
        <span className="rapport-status status-waiting">
          <AlertCircle size={14} />
          Refusé
        </span>
      );
    }

    if (
      [
        "correction_demandee",
        "correction demandée",
      ].includes(statut)
    ) {
      return (
        <span className="rapport-status status-progress">
          <AlertCircle size={14} />
          Correction demandée
        </span>
      );
    }

    if (
      [
        "en_cours_examen",
        "en cours d'examen",
        "en_cours",
        "en cours",
      ].includes(statut)
    ) {
      return (
        <span className="rapport-status status-progress">
          <Clock3 size={14} />
          En cours d'examen
        </span>
      );
    }

    return (
      <span className="rapport-status status-waiting">
        <AlertCircle size={14} />
        Soumis
      </span>
    );
  };

  /* Badge « En retard » (échéance dépassée) */
  const afficherRetard = (rapport) => {
    if (!rapport?.en_retard) {
      return null;
    }

    return (
      <span className="rapport-status status-danger">
        <AlertCircle size={14} />
        En retard
      </span>
    );
  };

  /*
   * =====================================================
   * LIBELLE DU ROLE
   * =====================================================
   */

  const obtenirLibelleRole = () => {

    if (role === ROLES.DIRECTEUR) {
      return "Direction générale";
    }

    if (role === ROLES.RH) {
      return "Ressources humaines";
    }

    if (role === ROLES.RESPONSABLE) {
      return "Responsable de service";
    }

    if (role === ROLES.EMPLOYE) {
      return "Employé";
    }

    if (role === ROLES.ADMINISTRATEUR) {
      return "Administrateur";
    }

    return "Utilisateur";
  };

  /*
   * =====================================================
   * INFORMATION RAPPORT
   * =====================================================
   */

  const obtenirMessageProduction = () => {

    if (role === ROLES.DIRECTEUR) {
      return "Vous consultez, contrôlez et validez les rapports.";
    }

    if (role === ROLES.RESPONSABLE) {
      return "Vous pouvez produire les rapports de votre service.";
    }

    if (role === ROLES.RH) {
      return "Vous pouvez produire et gérer les rapports selon vos permissions.";
    }

    if (role === ROLES.EMPLOYE) {
      return "Vous pouvez produire vos rapports d'activité.";
    }

    if (role === ROLES.ADMINISTRATEUR) {
      return "Accès complet à la gestion des rapports.";
    }

    return "";
  };
    /*
   * =====================================================
   * INTERFACE
   * =====================================================
   */

  return (
    <div className="rapports-page">

      <div className="rapports-header">

        <div>

          <div className="rapports-title-line">

            <div className="rapports-title-icon">
              <FileText size={23} />
            </div>

            <div>

              <h1>Rapports</h1>

              <p>
                Suivi et consultation des rapports de tâches
              </p>

            </div>

          </div>

        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {peutCreerRapport && (
            <button
              type="button"
              className="rapport-refresh-button"
              onClick={() => setModalNouveau(true)}
            >
              <FileText size={17} />
              Nouveau rapport
            </button>
          )}

          <button
            type="button"
            className="rapport-refresh-button"
            onClick={chargerRapports}
            disabled={chargement}
          >
            <RefreshCw
              size={17}
              className={
                chargement
                  ? "rotate-icon"
                  : ""
              }
            />

            Actualiser
          </button>
        </div>

      </div>

      <div className="rapport-statistics">

        <div className="rapport-stat-card">

          <div className="rapport-stat-icon blue">
            <FileText size={21} />
          </div>

          <div>
            <span>Total rapports</span>
            <strong>{total}</strong>
          </div>

        </div>

        <div className="rapport-stat-card">

          <div className="rapport-stat-icon green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Terminés</span>
            <strong>{termines}</strong>
          </div>

        </div>

        <div className="rapport-stat-card">

          <div className="rapport-stat-icon orange">
            <Clock3 size={21} />
          </div>

          <div>
            <span>En cours</span>
            <strong>{enCours}</strong>
          </div>

        </div>

        <div className="rapport-stat-card">

          <div className="rapport-stat-icon red">
            <BarChart3 size={21} />
          </div>

          <div>
            <span>En attente</span>
            <strong>{enAttente}</strong>
          </div>

        </div>

      </div>

      <div className="rapports-card">

        <div className="rapports-toolbar">

          <div>

            <h2>
              Liste des rapports
            </h2>

            <span>
              {rapportsFiltres.length} rapport
              {rapportsFiltres.length > 1
                ? "s"
                : ""}
            </span>

          </div>

          <div className="rapport-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Rechercher un rapport..."
              value={recherche}
              onChange={(event) =>
                setRecherche(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {erreur && (
          <div className="rapport-error">
            <AlertCircle size={18} />
            <span>{erreur}</span>
          </div>
        )}

        {!erreur &&
          peutVoirRapports &&
          (role === ROLES.DIRECTEUR ||
            role === ROLES.RH ||
            role === ROLES.RESPONSABLE ||
            role === ROLES.EMPLOYE ||
            role === ROLES.ADMINISTRATEUR) && (
            <div
              className="rapport-role-info"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
              }}
            >
              <ShieldCheck size={18} />

              <div>
                <strong>
                  {obtenirLibelleRole()}
                </strong>

                <div>
                  {obtenirMessageProduction()}
                </div>
              </div>

              {peutProduireRapport && (
                <span
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <UserPlus size={15} />
                  Production autorisée
                </span>
              )}
            </div>
          )}

        {chargement ? (

          <div className="rapport-loading">

            <RefreshCw
              size={28}
              className="rotate-icon"
            />

            <p>
              Chargement des rapports...
            </p>

          </div>

        ) : rapportsFiltres.length === 0 ? (

          <div className="rapport-empty">

            <FileText size={42} />

            <h3>
              {recherche
                ? "Aucun résultat"
                : "Aucun rapport disponible"}
            </h3>

            <p>
              {recherche
                ? "Aucun rapport ne correspond à votre recherche."
                : "Les rapports de tâches apparaîtront ici."}
            </p>

          </div>

        ) : (

          <div className="rapports-table-container">

            <table className="rapports-table">

              <thead>

                <tr>
                  <th>Rapport</th>
                  <th>Employé</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {rapportsFiltres.map(
                  (rapport, index) => (

                    <tr
                      key={
                        rapport.id_rapport ||
                        rapport.id ||
                        index
                      }
                    >

                      <td>

                        <div className="rapport-name">

                          <div className="rapport-row-icon">
                            <FileText size={16} />
                          </div>

                          <div>

                            <strong>
                              {obtenirTitre(
                                rapport
                              )}
                            </strong>

                            <span>
                              {obtenirDescription(
                                rapport
                              ).length > 70
                                ? `${obtenirDescription(
                                    rapport
                                  ).substring(0, 70)}...`
                                : obtenirDescription(
                                    rapport
                                  )}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>
                        <span className="rapport-employe">
                          {obtenirEmploye(
                            rapport
                          )}
                        </span>
                      </td>

                      <td>
                        {obtenirDate(
                          rapport
                        )}
                      </td>

                      <td>
                        {afficherStatut(
                          rapport
                        )}

                        {" "}
                        {afficherRetard(rapport)}
                      </td>

                      <td>

                        {peutVoirRapports && (
                          <button
                            type="button"
                            className="rapport-view-button"
                            onClick={() =>
                              setRapportSelectionne(
                                rapport
                              )
                            }
                          >
                            <Eye size={16} />
                            Voir
                          </button>
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ========================================================
          MODAL NOUVEAU RAPPORT PÉRIODIQUE
      ======================================================== */}

      {modalNouveau && (
        <div
          className="rapport-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setModalNouveau(false);
            }
          }}
        >
          <div
            className="rapport-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="rapport-modal-header">
              <div>
                <span>SOUMISSION</span>
                <h2>Nouveau rapport périodique</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalNouveau(false)
                }
              >
                ×
              </button>
            </div>

            <div className="rapport-modal-body">
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Votre rapport sera transmis à votre supérieur
                hiérarchique direct.
              </p>

              <div className="rapport-detail rapport-detail-full">
                <span>Période du début</span>
                <input
                  type="date"
                  value={
                    formulaire.date_debut_periode
                  }
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      date_debut_periode:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div className="rapport-detail rapport-detail-full">
                <span>Période de fin</span>
                <input
                  type="date"
                  value={
                    formulaire.date_fin_periode
                  }
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      date_fin_periode:
                        event.target.value,
                    })
                  }
                />
              </div>

              <div className="rapport-detail rapport-detail-full">
                <span>Travail effectué *</span>
                <textarea
                  rows={5}
                  value={
                    formulaire.travail_effectue
                  }
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      travail_effectue:
                        event.target.value,
                    })
                  }
                  placeholder="Activités réalisées sur la période..."
                  required
                />
              </div>

              <div className="rapport-detail rapport-detail-full">
                <span>Difficultés rencontrées</span>
                <textarea
                  rows={3}
                  value={
                    formulaire.difficultes
                  }
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      difficultes:
                        event.target.value,
                    })
                  }
                  placeholder="Obstacles, retards, besoins..."
                />
              </div>

              <div className="rapport-detail rapport-detail-full">
                <span>Commentaire</span>
                <textarea
                  rows={2}
                  value={
                    formulaire.commentaire
                  }
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      commentaire:
                        event.target.value,
                    })
                  }
                  placeholder="Information complémentaire..."
                />
              </div>
            </div>

            <div className="rapport-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setModalNouveau(false)
                }
                disabled={envoi}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={soumettreRapport}
                disabled={
                  envoi ||
                  !formulaire.travail_effectue.trim()
                }
              >
                {envoi
                  ? "Envoi en cours..."
                  : "Soumettre le rapport"}
              </button>
            </div>
          </div>
        </div>
      )}

            {rapportSelectionne && (

        <div
          className="rapport-modal-overlay"
          onClick={() =>
            setRapportSelectionne(null)
          }
        >

          <div
            className="rapport-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="rapport-modal-header">

              <div>

                <span>
                  CONSULTATION
                </span>

                <h2>
                  {obtenirTitre(
                    rapportSelectionne
                  )}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setRapportSelectionne(null)
                }
              >
                ×
              </button>

            </div>

            <div className="rapport-modal-body">

              <div className="rapport-detail">

                <span>
                  Employé
                </span>

                <strong>
                  {obtenirEmploye(
                    rapportSelectionne
                  )}
                </strong>

              </div>

              <div className="rapport-detail">

                <span>
                  Date
                </span>

                <strong>
                  {obtenirDate(
                    rapportSelectionne
                  )}
                </strong>

              </div>

              <div className="rapport-detail">

                <span>
                  Statut
                </span>

                <div>
                  {afficherStatut(
                    rapportSelectionne
                  )}
                </div>

              </div>

              <div className="rapport-detail rapport-detail-full">

                <span>
                  Description
                </span>

                <p>
                  {obtenirDescription(
                    rapportSelectionne
                  )}
                </p>

              </div>

              <div className="rapport-detail">

                <span>
                  Supérieur destinataire
                </span>

                <strong>
                  {rapportSelectionne.destinataire
                    ? `${rapportSelectionne.destinataire.prenom || ""} ${rapportSelectionne.destinataire.nom || ""}`.trim()
                    : "Non assigné"}
                </strong>

              </div>

              <div className="rapport-detail">

                <span>
                  Échéance
                </span>

                <strong>
                  {rapportSelectionne.date_limite_soumission
                    ? new Date(
                        rapportSelectionne.date_limite_soumission
                      ).toLocaleDateString("fr-FR")
                    : "Aucune échéance"}
                </strong>

                {" "}
                {afficherRetard(rapportSelectionne)}

              </div>

              {rapportSelectionne.motif_decision && (
                <div className="rapport-detail rapport-detail-full">

                  <span>
                    Motif de la décision
                  </span>

                  <p>
                    {rapportSelectionne.motif_decision}
                  </p>

                </div>
              )}

              {Array.isArray(
                rapportSelectionne.validations
              ) &&
                rapportSelectionne.validations
                  .length > 0 && (
                <div className="rapport-detail rapport-detail-full">

                  <span>
                    Historique des étapes
                  </span>

                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.85rem" }}>
                    {rapportSelectionne.validations.map(
                      (etape) => (
                        <li key={etape.id_validation}>
                          {etape.action} — niveau {etape.niveau}
                          {" "}
                          {etape.utilisateur
                            ? `(${etape.utilisateur.prenom} ${etape.utilisateur.nom})`
                            : ""}
                          {" "}
                          —{" "}
                          {etape.created_at
                            ? new Date(
                                etape.created_at
                              ).toLocaleString("fr-FR")
                            : ""}
                          {etape.motif
                            ? ` — ${etape.motif}`
                            : ""}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

              {peutControlerRapport && (

                <div className="rapport-detail rapport-detail-full">

                  <span>
                    Contrôle
                  </span>

                  <p>
                    Vous disposez de l'autorisation
                    de contrôle des rapports.
                  </p>

                </div>

              )}

              {peutValiderRapport &&
                ![
                  "valide",
                  "rejete",
                ].includes(
                  obtenirStatut(
                    rapportSelectionne
                  )
                ) && (

                <div className="rapport-detail rapport-detail-full">

                  <span>
                    Décision
                  </span>

                  <textarea
                    rows={2}
                    value={motif}
                    onChange={(event) =>
                      setMotif(
                        event.target.value
                      )
                    }
                    placeholder="Motif (obligatoire pour correction ou rejet)..."
                  />

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        deciderRapport("valide")
                      }
                      disabled={
                        enCoursDecision
                      }
                    >
                      {enCoursDecision
                        ? "..."
                        : "Valider"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deciderRapport(
                          "correction_demandee"
                        )
                      }
                      disabled={
                        enCoursDecision
                      }
                    >
                      Demander une correction
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deciderRapport("rejete")
                      }
                      disabled={
                        enCoursDecision
                      }
                    >
                      Refuser
                    </button>
                  </div>

                </div>

              )}

            </div>

            <div className="rapport-modal-footer">

              <button
                type="button"
                onClick={() =>
                  setRapportSelectionne(null)
                }
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Rapports;