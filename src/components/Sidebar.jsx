import { Link } from "react-router-dom"
import "./Sidebar.css"

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-title">
        <span className="sidebar-logo">G</span>
        <span>GAIN OFFICE</span>
      </div>

      <nav className="sidebar-menu">

        <Link to="/" className="active">
          <span>📊</span>
          <span>Dashboard</span>
        </Link>

        <Link to="/employes">
          <span>👥</span>
          <span>Employés</span>
        </Link>

        <Link to="/taches">
          <span>📋</span>
          <span>Tâches</span>
        </Link>

        <Link to="/demandes">
          <span>📩</span>
          <span>Demandes</span>
        </Link>

        <Link to="/notifications">
          <span>🔔</span>
          <span>Notifications</span>
        </Link>

      </nav>

      <div className="sidebar-bottom">

        <Link to="/parametres">
          <span>⚙️</span>
          <span>Paramètres</span>
        </Link>

        <Link to="/">
          <span>🚪</span>
          <span>Déconnexion</span>
        </Link>

      </div>

    </aside>
  )
}

export default Sidebar