import React from "react";
import "../App.css";
import { Link } from "react-router-dom";


const MentionsLegales = () => {
  return (
    <div className="page-container">
      <header className="header">
        <nav className="header-nav">
          <Link to="/Home" className="nav-link">Accueil</Link>
          <Link to="/exploration" className="nav-link"> Exploration des Métiers</Link>
        </nav>
      </header>

      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          
        </p>
      </section>

      <section>
        <h2>Responsable de la publication</h2>
        <p>
          Nom : <em></em><br />
          Prénom : <em></em><br />
          Fonction : <em></em><br />
          Email : <a href="mailto:"> </a>
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          
        </p>
      </section>

      <footer className="footer">
        <p>© 2026 - Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default MentionsLegales;
