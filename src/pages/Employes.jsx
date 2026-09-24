import "./Employes.css"
function Employes() {
  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h2>Employés</h2>
          <p>Gérez les employés de l'entreprise.</p>
        </div>

        <button className="add-button">
          + Ajouter un employé
        </button>
      </div>

      <div className="employee-tools">
        <input
          type="text"
          placeholder="🔍 Rechercher un employé..."
        />

        <select>
          <option value="">Tous les départements</option>
          <option value="informatique">Informatique</option>
          <option value="administration">Administration</option>
          <option value="commercial">Commercial</option>
        </select>

        <select>
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <div className="employee-table-card">

        <table className="employee-table">

          <thead>
            <tr>
              <th>Employé</th>
              <th>Fonction</th>
              <th>Département</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>
                <strong>Jean Kouassi</strong>
                <small>jean.kouassi@email.com</small>
              </td>

              <td>Développeur</td>
              <td>Informatique</td>
              <td>07 00 00 00 01</td>

              <td>
                <span className="employee-status active">
                  Actif
                </span>
              </td>

              <td>
                <button className="action-button">
                  Voir
                </button>

                <button className="action-button">
                  Modifier
                </button>
              </td>
            </tr>

            <tr>
              <td>
                <strong>Marie Yao</strong>
                <small>marie.yao@email.com</small>
              </td>

              <td>Assistante</td>
              <td>Administration</td>
              <td>07 00 00 00 02</td>

              <td>
                <span className="employee-status active">
                  Actif
                </span>
              </td>

              <td>
                <button className="action-button">
                  Voir
                </button>

                <button className="action-button">
                  Modifier
                </button>
              </td>
            </tr>

            <tr>
              <td>
                <strong>Paul Koffi</strong>
                <small>paul.koffi@email.com</small>
              </td>

              <td>Commercial</td>
              <td>Commercial</td>
              <td>07 00 00 00 03</td>

              <td>
                <span className="employee-status inactive">
                  Inactif
                </span>
              </td>

              <td>
                <button className="action-button">
                  Voir
                </button>

                <button className="action-button">
                  Modifier
                </button>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Employes