import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

/** Coque commune de toutes les pages accessibles après connexion. */
export default function AppLayout({ utilisateur, onDeconnexion, children }) {
  return (
    <div className="app-layout">
      <a className="app-skip-link" href="#main-content">
        Aller au contenu
      </a>

      <Sidebar
        utilisateur={utilisateur}
        onDeconnexion={onDeconnexion}
      />

      <div className="app-main">
        <Header
          utilisateur={utilisateur}
          onDeconnexion={onDeconnexion}
        />

        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
