function Dashboard() {
  return (
    <div className="dashboard">

      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h2>Bonjour Claudel 👋</h2>
          <p>Voici un aperçu de l'activité de GAIN OFFICE.</p>
        </div>

        <button className="add-button">
          + Nouvelle tâche
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <p>Employés</p>
            <h3>24</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div>
            <p>Tâches en cours</p>
            <h3>12</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📩</div>
          <div>
            <p>Demandes en attente</p>
            <h3>5</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p>Tâches terminées</p>
            <h3>18</h3>
          </div>
        </div>

      </div>

      {/* Contenu principal */}
      <div className="dashboard-grid">

        {/* Tâches récentes */}
        <div className="dashboard-card">

          <div className="card-header">
            <h3>Tâches récentes</h3>
            <a href="/taches">Voir tout</a>
          </div>

          <div className="task">
            <div>
              <strong>Développement du site web</strong>
              <p>Assignée à : Jean Kouassi</p>
            </div>

            <span className="status progress">
              En cours
            </span>
          </div>

          <div className="task">
            <div>
              <strong>Rapport mensuel</strong>
              <p>Assignée à : Marie Yao</p>
            </div>

            <span className="status waiting">
              En attente
            </span>
          </div>

          <div className="task">
            <div>
              <strong>Mise à jour des données</strong>
              <p>Assignée à : Paul Koffi</p>
            </div>

            <span className="status done">
              Terminée
            </span>
          </div>

          <div className="task">
            <div>
              <strong>Préparation de la réunion</strong>
              <p>Assignée à : Alice N'Guessan</p>
            </div>

            <span className="status progress">
              En cours
            </span>
          </div>

        </div>

        {/* Activité récente */}
        <div className="dashboard-card">

          <div className="card-header">
            <h3>Activité récente</h3>
          </div>

          <div className="activity">
            <span>👤</span>
            <div>
              <strong>Nouvel employé ajouté</strong>
              <p>Il y a 10 minutes</p>
            </div>
          </div>

          <div className="activity">
            <span>📋</span>
            <div>
              <strong>Nouvelle tâche créée</strong>
              <p>Il y a 30 minutes</p>
            </div>
          </div>

          <div className="activity">
            <span>📩</span>
            <div>
              <strong>Nouvelle demande reçue</strong>
              <p>Il y a 1 heure</p>
            </div>
          </div>

          <div className="activity">
            <span>✅</span>
            <div>
              <strong>Tâche terminée</strong>
              <p>Il y a 2 heures</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard