import React from "react";
import "../App.css";
import { Link } from "react-router-dom";


const PolitiqueConfidentialite = () => {
  return (
    <div className="page-container">
      <header className="header">
            <nav className="header-nav">
              <Link to="/Home" className="nav-link">Accueil</Link>
              <Link to="/exploration" className="nav-link"> Exploration des Métiers</Link>
            </nav>
          </header>

      <h1>Politique de confidentialité</h1>

      <section>
        <h2>Données collectées</h2>
        <p>
          
        </p>
      </section>

     

      <footer className="footer">
        <p>© 2026 - Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default PolitiqueConfidentialite;
