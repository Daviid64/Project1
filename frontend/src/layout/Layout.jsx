import { Link } from "react-router-dom";
import "../pages/metiers_numerique.css";
export default function Layout({ children }) {
  return (
    <div className="page-container">
      <header className="header">
        <nav className="header-nav">
          <Link to="/home" className="nav-link">Accueil</Link>
          <Link to="/exploration" className="nav-link">Exploration des Métiers</Link>
        </nav>
      </header>

      <main className="metier-main">
        {children}
      </main>

      <footer className="footer">
        <p>© 2025 AFEC - Tous droits réservés</p>
        <p>
          <Link to="/mentions-legales">Mentions légales</Link> |{" "}
          <Link to="/privacy-policy">Politique de confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
