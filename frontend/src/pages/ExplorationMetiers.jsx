import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import '../index.css';

function ExplorationMetier() {
  const metiers = [
  { name: "Développement Backend", slug: "developpeur-backend" },
  { name: "Développement Frontend", slug: "developpeur-frontend" },
  { name: "Développement Fullstack", slug: "developpeur-fullstack" },
  { name: "Intégrateur Web", slug: "integrateur-web" },
  { name: "Scrum Master", slug: "scrum-master" },
  { name: "UX/UI Designer", slug: "ux-ui-designer" },
  { name: "Graphiste / Motion Designer", slug: "motion-designer" },
  { name: "Data Scientist", slug: "data-scientist" },
  { name: "Product Owner", slug: "product-owner" },
  { name: "Data Analyst", slug: "data-analyst" },
  { name: "Expert Cybersécurité", slug: "expert-cybersecurite" },
  { name: "Administrateur Réseau", slug: "administrateur-reseau" },
  { name: "Développeur IA", slug: "developpeur-ia" },
];

  
   const [user, setUser] = useState(null);
 
   // Charger l'utilisateur depuis le localStorage
   useEffect(() => {
     const storedUser = localStorage.getItem("user");
     if (storedUser) {
       try {
         setUser(JSON.parse(storedUser));
       } catch {
         console.error("Erreur lors du parsing du user stocké.");
         localStorage.removeItem("user");
         localStorage.removeItem("token");
       }
     }
   }, []);

  return (
    <div className="exploration-container">
      {/* HEADER conservé */}
      <header className="header">
        <nav className="header-nav">
          <Link to="/Home" className="nav-link">Accueil</Link>
          <Link to="/course" className="nav-link">Cours</Link>
        </nav>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <h2 className="main-title">Découvrez les métiers du numérique</h2>
        <p className="subtitle">
          Explorez les différents métiers du digital et trouvez votre voie dans un secteur en pleine expansion.
        </p>

        <div className="metiers-grid">
          {metiers.map((metier) => (
            <Link key={metier.slug} to={`/metier/${metier.slug}`} className="metier-card">
              <span className="metier-name">{metier.name}</span>
            </Link>
          ))}
        </div>
      </main>

      {/* FOOTER conservé */}
      <footer className="footer">
        <p>© 2026 - Tous droits réservés |{" "}</p>
          <p>
            <Link to="/mentions-legales">Mentions légales</Link> |{" "}
            <Link to="/privacy-policy">Politique de confidentialité</Link> |{" "}
          </p>
      </footer>
    </div>
  );
}

export default ExplorationMetier;
