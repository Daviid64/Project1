import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Tentative de connexion...");
      
      // Le backend envoie les tokens dans des cookies HTTP-only
      const data = await API.post("/auth/login", { email, password });
      
      console.log("Connexion réussie:", data);

      if (data.success && data.user) {
        // Stocker uniquement les infos utilisateur (pas les tokens)
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log("Utilisateur connecté:", data.user);
        console.log("Rôles:", data.user.roles);

        // Redirection selon le rôle
        const roles = data.user.roles || [];
        
        if (roles.includes("super_admin") || roles.includes("coordinateur")) {
          window.location.href = "/admin";
        } else if (roles.includes("stagiaire")) {
          window.location.href = "/home";
        } else {
          window.location.href = "/";
        }
      } else {
        setError("Erreur lors de la connexion");
      }
    } catch (err) {
      console.error("Erreur login:", err);
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse email"
              required
              disabled={loading}
              className={loading ? "loading" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              disabled={loading}
              className={loading ? "loading" : ""}
            />
          </div>

          <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgotPassword">Mot de passe oublié ?</Link>
          <span>•</span>
          <Link to="/">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
