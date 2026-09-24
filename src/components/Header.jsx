import "./Header.css"

function Header() {
  return (
    <header className="header">

      <div className="logo">
        <h1>GAIN OFFICE</h1>
      </div>

      <nav className="navigation">
        <a href="#">Dashboard</a>
        <a href="#">Employés</a>
        <a href="#">Tâches</a>
        <a href="#">Demandes</a>
      </nav>

      <div className="header-actions">
        <button>🔔</button>
        <button>👤</button>
      </div>

    </header>
  )
}

export default Header