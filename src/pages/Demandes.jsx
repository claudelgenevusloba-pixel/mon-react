import { useEffect, useMemo, useState } from "react"

import {
  Plus,
  Search,
  FileText,
  Clock3,
  CircleCheck,
  CircleX,
  X,
  UserRound,
  CalendarDays,
  ShieldCheck,
  Check,
  AlertCircle
} from "lucide-react"

import { PERMISSIONS } from "../config/permissions"
import {
  aPermission,
  getRole
} from "../config/access"
import { ROLES } from "../config/roles"

import "../styles/pages/demandes.css"


const demandesInitiales = [
  {
    id: 1,
    objet: "Demande d'autorisation d'absence",
    demandeur: "Employé",
    type: "Absence",
    date: "24 septembre 2026",
    statut: "En attente",
    description:
      "Demande d'autorisation pour une absence exceptionnelle."
  },
  {
    id: 2,
    objet: "Demande de congé",
    demandeur: "Responsable Équipe",
    type: "Congé",
    date: "23 septembre 2026",
    statut: "Acceptée",
    description:
      "Demande de congé annuel."
  },
  {
    id: 3,
    objet: "Demande de document administratif",
    demandeur: "Employé",
    type: "Document",
    date: "22 septembre 2026",
    statut: "Refusée",
    description:
      "Demande concernant un document administratif."
  }
]


const typesDemande = [
  "Absence",
  "Congé",
  "Document",
  "Autorisation",
  "Autre"
];


function Demandes({ utilisateur }) {

  const role = getRole(utilisateur) || ROLES.EMPLOYE

  const [demandes, setDemandes] = useState(
    demandesInitiales
  )

  const [recherche, setRecherche] = useState("")
  const [filtre, setFiltre] = useState("Tous")

  const [modalCreation, setModalCreation] =
    useState(false)

  const [demandeSelectionnee, setDemandeSelectionnee] =
    useState(null)

  const [formulaire, setFormulaire] = useState({
    type: "Absence",
    objet: "",
    message: ""
  })

  const [message, setMessage] = useState("")

  /*
   * OUVERTURE AUTOMATIQUE DE LA MODALE DE CRÉATION
   * (lien « Nouvelle demande » du tableau de bord : /demandes?nouvelle=1)
   */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    )

    if (params.get("nouvelle") === "1") {
      setModalCreation(true)
    }
  }, [])


  /*
   * PERMISSIONS
   */

  const peutVoirDemandes = aPermission(
    utilisateur,
    PERMISSIONS.VOIR_DEMANDES
  )

  const peutCreerPermission = aPermission(
    utilisateur,
    PERMISSIONS.CREER_DEMANDE
  )

  const peutModifierDemande = aPermission(
    utilisateur,
    PERMISSIONS.MODIFIER_DEMANDE
  )

  const peutTraiter = aPermission(
    utilisateur,
    PERMISSIONS.TRAITER_DEMANDE
  )

  const peutAccepter = aPermission(
    utilisateur,
    PERMISSIONS.ACCEPTER_DEMANDE
  )

  const peutRefuser = aPermission(
    utilisateur,
    PERMISSIONS.REFUSER_DEMANDE
  )


  /*
   * RÈGLE MÉTIER :
   * Le Directeur ne crée pas de demande.
   */

  const peutCreer =
    peutCreerPermission &&
    role !== ROLES.DIRECTEUR


  /*
   * VISIBILITÉ DES DEMANDES
   */

  const demandesVisibles = useMemo(() => {

    let resultat = [...demandes]


    /*
     * Un employé voit ses demandes.
     * Les responsables/RH/Direction voient
     * les demandes de gestion.
     */

    if (role === ROLES.EMPLOYE) {

      const nomComplet = [
        utilisateur?.nom,
        utilisateur?.prenom
      ]
        .filter(Boolean)
        .join(" ")

      resultat = resultat.filter(
        (demande) =>
          demande.demandeur === utilisateur?.nom ||
          demande.demandeur === nomComplet ||
          demande.demandeur === "Employé"
      )
    }


    /*
     * RECHERCHE
     */

    if (recherche.trim()) {

      const terme = recherche
        .toLowerCase()
        .trim()

      resultat = resultat.filter(
        (demande) =>
          demande.objet
            .toLowerCase()
            .includes(terme) ||
          demande.type
            .toLowerCase()
            .includes(terme) ||
          demande.demandeur
            .toLowerCase()
            .includes(terme)
      )
    }


    /*
     * FILTRE STATUT
     */

    if (filtre !== "Tous") {

      resultat = resultat.filter(
        (demande) =>
          demande.statut === filtre
      )
    }


    return resultat

  }, [
    demandes,
    recherche,
    filtre,
    role,
    utilisateur
  ])


  /*
   * STATISTIQUES
   */

  const total = demandesVisibles.length

  const enAttente =
    demandesVisibles.filter(
      (demande) =>
        demande.statut === "En attente"
    ).length

  const acceptees =
    demandesVisibles.filter(
      (demande) =>
        demande.statut === "Acceptée"
    ).length

  const refusees =
    demandesVisibles.filter(
      (demande) =>
        demande.statut === "Refusée"
    ).length


  /*
   * FERMETURE DES FENÊTRES
   */

  const fermerTout = () => {

    setModalCreation(false)
    setDemandeSelectionnee(null)
    setMessage("")
  }
    /*
   * TRAITEMENT D'UNE DEMANDE
   */

  const traiterDemande = (
    id,
    nouveauStatut
  ) => {

    if (
      nouveauStatut === "Acceptée" &&
      !peutAccepter
    ) {
      return
    }

    if (
      nouveauStatut === "Refusée" &&
      !peutRefuser
    ) {
      return
    }

    if (!peutTraiter) {
      return
    }


    setDemandes((ancienneListe) =>
      ancienneListe.map((demande) =>
        demande.id === id
          ? {
              ...demande,
              statut: nouveauStatut
            }
          : demande
      )
    )


    setMessage(
      nouveauStatut === "Acceptée"
        ? "La demande a été acceptée."
        : "La demande a été refusée."
    )


    setDemandeSelectionnee(null)


    setTimeout(() => {
      setMessage("")
    }, 3000)
  }


  /*
   * FORMULAIRE
   */

  const modifierFormulaire = (
    event
  ) => {

    const {
      name,
      value
    } = event.target

    setFormulaire((ancien) => ({
      ...ancien,
      [name]: value
    }))
  }


  /*
   * ENVOI D'UNE NOUVELLE DEMANDE
   */

  const envoyerDemande = () => {

    if (!peutCreer) {
      return
    }


    if (
      !formulaire.objet.trim() ||
      !formulaire.message.trim()
    ) {

      setMessage(
        "Veuillez remplir tous les champs obligatoires."
      )

      setTimeout(() => {
        setMessage("")
      }, 3000)

      return
    }


    const dateActuelle =
      new Date().toLocaleDateString(
        "fr-FR",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      )


    const nomDemandeur =
      [
        utilisateur?.nom,
        utilisateur?.prenom
      ]
        .filter(Boolean)
        .join(" ") ||
      utilisateur?.nom ||
      "Employé"


    const nouvelleDemande = {

      id: Date.now(),

      objet:
        formulaire.objet.trim(),

      demandeur:
        nomDemandeur,

      type:
        formulaire.type,

      date:
        dateActuelle,

      statut:
        "En attente",

      description:
        formulaire.message.trim()
    }


    setDemandes(
      (ancienneListe) => [
        nouvelleDemande,
        ...ancienneListe
      ]
    )


    setFormulaire({
      type: "Absence",
      objet: "",
      message: ""
    })


    setModalCreation(false)


    setMessage(
      "Votre demande a été envoyée avec succès."
    )


    setTimeout(() => {
      setMessage("")
    }, 3000)
  }


  /*
   * CLASSE DU STATUT
   */

  const obtenirClasseStatut = (
    statut
  ) => {

    if (statut === "Acceptée") {
      return "accepted"
    }

    if (statut === "Refusée") {
      return "refused"
    }

    return "pending"
  }


  /*
   * SI L'UTILISATEUR N'A PAS ACCÈS
   */

  if (!peutVoirDemandes) {

    return (
      <div className="demandes-page">

        <section className="demandes-empty">

          <AlertCircle size={32} />

          <h3>
            Accès non autorisé
          </h3>

          <p>
            Vous n'avez pas la permission
            d'accéder au module des demandes.
          </p>

        </section>

      </div>
    )
  }


  return (

    <div className="demandes-page">

      {message && (

        <div className="demande-toast">

          <Check size={17} />

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>

        </div>
      )}


      <header className="demandes-header">

        <div>

          <span className="demandes-eyebrow">
            GAIN OFFICE
          </span>

          <h1>
            Demandes
          </h1>

          <p>
            {role === ROLES.EMPLOYE
              ? "Envoyez et suivez vos demandes."
              : "Gérez les demandes reçues des collaborateurs."
            }
          </p>

        </div>


        {peutCreer && (

          <button
            type="button"
            className="demandes-primary-button"
            onClick={() =>
              setModalCreation(true)
            }
          >

            <Plus size={18} />

            Nouvelle demande

          </button>
        )}

      </header>


      <section className="demandes-role-banner">

        <div className="demandes-role-icon">

          {peutTraiter ? (
            <ShieldCheck size={19} />
          ) : (
            <UserRound size={19} />
          )}

        </div>


        <div>

          <strong>

            {peutTraiter
              ? "Espace de gestion"
              : "Espace personnel"
            }

          </strong>

          <span>

            {peutTraiter
              ? "Consultez et traitez les demandes des collaborateurs."
              : "Créez et suivez vos demandes administratives."
            }

          </span>

        </div>

      </section>
            <section className="demandes-stats">

        <div className="demande-stat-card">

          <div className="demande-stat-icon total">

            <FileText size={19} />

          </div>

          <div>

            <strong>
              {total}
            </strong>

            <span>
              Total
            </span>

          </div>

        </div>


        <div className="demande-stat-card">

          <div className="demande-stat-icon pending">

            <Clock3 size={19} />

          </div>

          <div>

            <strong>
              {enAttente}
            </strong>

            <span>
              En attente
            </span>

          </div>

        </div>


        <div className="demande-stat-card">

          <div className="demande-stat-icon accepted">

            <CircleCheck size={19} />

          </div>

          <div>

            <strong>
              {acceptees}
            </strong>

            <span>
              Acceptées
            </span>

          </div>

        </div>


        <div className="demande-stat-card">

          <div className="demande-stat-icon refused">

            <CircleX size={19} />

          </div>

          <div>

            <strong>
              {refusees}
            </strong>

            <span>
              Refusées
            </span>

          </div>

        </div>

      </section>


      <section className="demandes-toolbar">

        <div className="demandes-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Rechercher une demande..."
            value={recherche}
            onChange={(event) =>
              setRecherche(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={filtre}
          onChange={(event) =>
            setFiltre(
              event.target.value
            )
          }
        >

          <option value="Tous">
            Tous les statuts
          </option>

          <option value="En attente">
            En attente
          </option>

          <option value="Acceptée">
            Acceptées
          </option>

          <option value="Refusée">
            Refusées
          </option>

        </select>

      </section>


      <section className="demandes-list">

        {demandesVisibles.length === 0 ? (

          <div className="demandes-empty">

            <FileText size={30} />

            <h3>
              Aucune demande trouvée
            </h3>

            <p>
              Aucune demande ne correspond
              à vos critères.
            </p>

          </div>

        ) : (

          demandesVisibles.map(
            (demande) => (

              <article
                className="demande-card"
                key={demande.id}
              >

                <div className="demande-icon">

                  <FileText size={19} />

                </div>


                <div className="demande-content">

                  <div className="demande-title-row">

                    <h2>
                      {demande.objet}
                    </h2>


                    <span
                      className={`demande-status ${obtenirClasseStatut(
                        demande.statut
                      )}`}
                    >
                      {demande.statut}
                    </span>

                  </div>


                  <p>
                    {demande.description}
                  </p>


                  <div className="demande-meta">

                    <span>

                      <UserRound size={13} />

                      {demande.demandeur}

                    </span>


                    <span>

                      <CalendarDays size={13} />

                      {demande.date}

                    </span>


                    <span>

                      <FileText size={13} />

                      {demande.type}

                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  className="demande-view-button"
                  onClick={() =>
                    setDemandeSelectionnee(
                      demande
                    )
                  }
                >
                  Voir
                </button>

              </article>

            )
          )

        )}

      </section>


      {modalCreation && (

        <div
          className="demande-modal-overlay"
          onClick={fermerTout}
        >

          <div
            className="demande-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="demande-modal-header">

              <div>

                <span>
                  NOUVELLE DEMANDE
                </span>

                <h2>
                  Envoyer une demande
                </h2>

                <p>
                  Remplissez les informations
                  nécessaires.
                </p>

              </div>


              <button
                type="button"
                onClick={fermerTout}
              >
                <X size={19} />
              </button>

            </div>


            <div className="demande-modal-body">

              <label>

                Type de demande

                <select
                  name="type"
                  value={formulaire.type}
                  onChange={modifierFormulaire}
                >

                  {typesDemande.map(
                    (type) => (

                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>

                    )
                  )}

                </select>

              </label>


              <label>

                Objet

                <input
                  type="text"
                  name="objet"
                  value={formulaire.objet}
                  onChange={modifierFormulaire}
                  placeholder="Objet de votre demande"
                />

              </label>


              <label>

                Message

                <textarea
                  name="message"
                  value={formulaire.message}
                  onChange={modifierFormulaire}
                  rows="5"
                  placeholder="Expliquez votre demande..."
                />

              </label>

            </div>


            <div className="demande-modal-footer">

              <button
                type="button"
                onClick={fermerTout}
              >
                Annuler
              </button>


              <button
                type="button"
                className="demande-submit"
                onClick={envoyerDemande}
              >

                <Check size={16} />

                Envoyer la demande

              </button>

            </div>

          </div>

        </div>

      )}
            {demandeSelectionnee && (

        <div
          className="demande-modal-overlay"
          onClick={() =>
            setDemandeSelectionnee(null)
          }
        >

          <div
            className="demande-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="demande-modal-header">

              <div>

                <span>
                  DÉTAIL DE LA DEMANDE
                </span>

                <h2>
                  {demandeSelectionnee.objet}
                </h2>

                <p>
                  Informations relatives
                  à cette demande.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setDemandeSelectionnee(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>


            <div className="demande-detail-body">

              <div className="demande-detail-description">

                <span>
                  Description
                </span>

                <p>
                  {
                    demandeSelectionnee.description
                  }
                </p>

              </div>


              <div className="demande-detail-grid">

                <div>

                  <span>
                    Demandeur
                  </span>

                  <strong>

                    <UserRound size={14} />

                    {
                      demandeSelectionnee.demandeur
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Type
                  </span>

                  <strong>

                    <FileText size={14} />

                    {
                      demandeSelectionnee.type
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Date
                  </span>

                  <strong>

                    <CalendarDays size={14} />

                    {
                      demandeSelectionnee.date
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Statut
                  </span>

                  <strong
                    className={`detail-status ${obtenirClasseStatut(
                      demandeSelectionnee.statut
                    )}`}
                  >
                    {
                      demandeSelectionnee.statut
                    }
                  </strong>

                </div>

              </div>

            </div>


            {peutTraiter &&
              demandeSelectionnee.statut ===
                "En attente" && (

              <div className="demande-processing">

                <div>

                  <ShieldCheck size={18} />

                  <div>

                    <strong>
                      Traitement de la demande
                    </strong>

                    <span>
                      Choisissez une décision.
                    </span>

                  </div>

                </div>


                <section>

                  {peutRefuser && (

                    <button
                      type="button"
                      className="demande-refuse"
                      onClick={() =>
                        traiterDemande(
                          demandeSelectionnee.id,
                          "Refusée"
                        )
                      }
                    >

                      <CircleX size={16} />

                      Refuser

                    </button>

                  )}


                  {peutAccepter && (

                    <button
                      type="button"
                      className="demande-accept"
                      onClick={() =>
                        traiterDemande(
                          demandeSelectionnee.id,
                          "Acceptée"
                        )
                      }
                    >

                      <CircleCheck size={16} />

                      Accepter

                    </button>

                  )}

                </section>

              </div>

            )}


            {!peutTraiter &&
              demandeSelectionnee.statut ===
                "En attente" && (

              <div className="demande-information">

                <AlertCircle size={17} />

                <span>
                  Votre demande est actuellement
                  en attente de traitement.
                </span>

              </div>

            )}


            {demandeSelectionnee.statut ===
              "Acceptée" && (

              <div className="demande-success">

                <CircleCheck size={17} />

                <span>
                  Cette demande a été acceptée.
                </span>

              </div>

            )}


            {demandeSelectionnee.statut ===
              "Refusée" && (

              <div className="demande-danger">

                <CircleX size={17} />

                <span>
                  Cette demande a été refusée.
                </span>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  )
}


export default Demandes