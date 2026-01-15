import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();

  // Récupère le token dans l'URL
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/reset-password", {
        token,
       password: newPassword,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Réinitialiser le mot de passe</h2>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">Changer le mot de passe</button>
        {message && <p className="login-message">{message}</p>}
      </form>
    </div>
  );
}
