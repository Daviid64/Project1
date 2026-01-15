import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import API from "../api.js";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    agency: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "stagiaire",
  });
  const [message, setMessage] = useState("");

  const agences = [
    { id: 1, name: "Afec Bayonne" },
    { id: 2, name: "Afec Pau" },
    { id: 3, name: "Afec Bordeaux" },
    { id: 4, name: "Afec Angoulème" },
    { id: 5, name: "Afec La Rochelle" },
    { id: 6, name: "Afec Agen" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/register", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        agency_id: formData.agency,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      if (response.data.success) {
        setMessage("Inscription réussie !");
        navigate("/login");
      } else {
        setMessage(response.data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error("Erreur register", err);
      setMessage(err.response?.data?.message || "Erreur de connexion au serveur");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Inscription</h2>

        <input
          className="login-input"
          type="text"
          name="firstName"
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="text"
          name="lastName"
          placeholder="Nom"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <select
          className="login-input"
          name="agency"
          value={formData.agency}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Choisir une agence</option>
          {agences.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <input
          className="login-input"
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          className="login-input"
          type="password"
          name="confirmPassword"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <select
          className="login-input"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="stagiaire">Stagiaire</option>
          <option value="coordinateur">Coordinateur</option>
        </select>

        <button className="login-button" type="submit">S'inscrire</button>

        {message && <p className="login-message">{message}</p>}

        <p className="login-link">
          Déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
        </p>
      </form>
    </div>
  );
}
