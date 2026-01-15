import { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import API from "../api.js";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();     // Empêche le rechargement de la page
        setMessage("");     // Réinitialise le message visible avant la nouvelle requête
    

    try {
        const response = await API.post('/auth/forgotPassword', {
        email,    
        });

        if (response.data.success) {
            setMessage(response.data.message);
        }
    } catch (err) {
        console.error("Erreur forgot password", err);
        if (err.response?.data?.message) {
            setMessage(err.response?.data?.message);
        } else {
            setMessage("Erreur de connexion au serveur");
        }
    }
}

return (
    <div className="login-container">
        <div className="forgot-password-form">
        <form onSubmit={handleSubmit}>
        <h2 className="login-title">Mot de passe oublié</h2> 

        <input 
        type="email" 
        placeholder="Adresse e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
        required
        />

        <button type="submit" className="login-button">
            Envoyer le lien
        </button>

        {message && <p className="login-message">{message}</p>}
        </form>

        <div className="forgot-password">
            <Link to="/login">Retour à la page de connexion</Link>
        </div>
     </div>   
    </div>
);
}