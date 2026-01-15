import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import RGPDCookieBanner from "../components/RGPDCookieBanner.jsx";
import API from "../api.js";

function Acceuil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Charger l'utilisateur depuis le backend (cookie HttpOnly)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me"); // backend doit renvoyer { user }
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    };
    fetchUser();
  }, []);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  };

  return (
    <div className="page-container">
      <header className="header">
        <nav className="header-nav">
          <Link to="/exploration" className="nav-link">
            Exploration des Métiers
          </Link>
          {user && (
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          )}
        </nav>
      </header>

      <main className="main-content">
        <h2>Découvrez les métiers du numérique avec l’AFEC</h2>
        <p>
          Le numérique est partout : dans nos entreprises, nos vies et nos métiers.
          Mais savez-vous vraiment quelles opportunités il offre ? Avec l’AFEC,
          explorez un univers de carrières passionnantes et accessibles à tous :
          développement web, cybersécurité, data, et design web ! À travers nos
          programmes de découverte, nos témoignages de professionnels et nos
          formations certifiantes, nous vous aidons à mieux comprendre les métiers
          du digital et à trouver celui qui vous correspond. Découvrez, apprenez
          et construisez votre parcours avec l’AFEC.
        </p>

        <div className="button-container">
          <Link to="/exploration" className="explore-button">
            Exploration Métiers
          </Link>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 - Tous droits réservés | </p>
        <p>
          <Link to="/mentions-legales">Mentions légales</Link> |{" "}
          <Link to="/privacy-policy">Politique de confidentialité</Link>
        </p>
      </footer>

      <RGPDCookieBanner />
    </div>
  );
}

export default Acceuil;
