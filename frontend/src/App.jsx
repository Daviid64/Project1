import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./index.css";
import MentionsLegales from "./components/MentionsLegales.jsx";
import PolitiqueConfidentialite from "./components/PolitiqueConfidentialite.jsx";
import Acceuil from "./pages/Home.jsx";
import ExplorationMetiers from "./pages/ExplorationMetiers.jsx";
import MetierPage from "./pages/metiers.jsx";
import LoginPage from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPasswordPage from "./components/forgotPassword.jsx";
import ResetPasswordPage from "./components/ResetPassword.jsx";
import AdminPage from "./pages/Admin.jsx";
// ... autres pages métiers

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?.id) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?.id) return <Navigate to="/login" replace />;
  if (!user.roles?.includes("super_admin") && !user.roles?.includes("coordinateur")) {
    return <Navigate to="/Home" replace />;
  }
  return children;
}

function RedirectIfLoggedIn({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.id) {
    if (user.roles?.includes("super_admin") || user.roles?.includes("coordinateur")) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/Home" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes protégées */}
        <Route path="/Home" element={<ProtectedRoute><Acceuil /></ProtectedRoute>} />
        <Route path="/exploration" element={<ProtectedRoute><ExplorationMetiers /></ProtectedRoute>} />
        {/* Routes admin */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        {/* Connexion/inscription */}
        <Route path="/login" element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
        <Route path="/" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Routes publiques */}
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/privacy-policy" element={<PolitiqueConfidentialite />} />
        {/*Routes métiers*/}
        <Route path="/metier/:slug" element={<ProtectedRoute><MetierPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
