import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./Admin.css";
import API from "../api.js";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [error, setError] = useState(null);

  // Fonction pour normaliser les rôles
  const getRolesArray = (user) => {
    // Vérifier role_name en priorité (c'est ce que le backend renvoie)
    if (user.role_name) {
      return [String(user.role_name).toLowerCase().trim()];
    }
    // Fallback sur roles si présent
    if (Array.isArray(user.roles)) {
      return user.roles.map(r => String(r).toLowerCase().trim());
    }
    if (typeof user.roles === 'string') {
      return user.roles.split(",").map(r => r.toLowerCase().trim());
    }
    return [];
  };

  // Vérifier si un utilisateur est super_admin ou coordinateur
  const isSuperAdminOrCoordinator = (user) => {
    const roles = getRolesArray(user);
    return roles.includes("super_admin") || 
           roles.includes("coordinateur") ||
           roles.includes("super admin");
  };

  // Formater la durée
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0h 00m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  // Formater la date et heure
  const formatDateTime = (dateString) => {
    if (!dateString) return "Jamais";
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Jamais";
    }
  };

  // Récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await API.get("/admin/users");

      // La réponse peut être directement les données ou { data: [...] }
      const usersList = response.data || response || [];

      console.log("Utilisateurs récupérés:", usersList.length);
      
      // Log pour voir la structure complète d'un utilisateur
      if (usersList.length > 0) {
        console.log("Structure complète d'un utilisateur:", usersList[0]);
        console.log("Champs agence disponibles:", {
          agency_name: usersList[0].agency_name,
          agency_region: usersList[0].agency_region,
          agency_id: usersList[0].agency_id,
          // Vérifier d'autres variantes possibles
          agencyName: usersList[0].agencyName,
          agencyRegion: usersList[0].agencyRegion
        });
      }

      // Filtrer super_admin et coordinateur
      const filtered = usersList.filter((u) => {
        const shouldExclude = isSuperAdminOrCoordinator(u);
        if (shouldExclude) {
          console.log("EXCLUSION:", u.email, "- role_name:", u.role_name);
        }
        return !shouldExclude;
      });

      console.log("Utilisateurs après filtrage:", filtered.length);
      setUsers(filtered);
    } catch (err) {
      console.error("Erreur fetch users:", err);
      setError(err.message || "Impossible de récupérer les utilisateurs");
      
      // Si erreur 401, rediriger vers login
      if (err.message?.includes("401") || err.message?.includes("Authentification")) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  };

  // Initial fetch + actualisation toutes les 30s
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Déconnexion admin
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Erreur logout:", err);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // Liste unique des agences
  const agencies = [...new Set(users.map((u) => u.agency_name).filter(Boolean))].sort();

  // Liste unique des statuts
  const statuses = [...new Set(users.map((u) => u.status).filter(Boolean))].sort();

  // Validation
  const handleValidation = async (id, status) => {
    if (!["approved", "rejected"].includes(status)) {
      alert("Statut invalide");
      return;
    }
    
    setLoading(true);
    try {
      await API.patch(`/admin/users/${id}/validate`, { status });
      
      // Mettre à jour l'état local
      setUsers((prev) => 
        prev.map((u) => (u.id === id ? { ...u, status } : u))
      );
      
      alert(`Utilisateur ${status === "approved" ? "approuvé" : "rejeté"} avec succès`);
      
      // Rafraîchir la liste
      fetchUsers();
    } catch (err) {
      console.error("Erreur validation:", err);
      alert(err.message || "Impossible de mettre à jour le statut");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer utilisateur
  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    const confirmMessage = user 
      ? `Êtes-vous sûr de vouloir supprimer ${user.first_name} ${user.last_name} ?`
      : "Êtes-vous sûr de vouloir supprimer cet utilisateur ?";
    
    if (!window.confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      await API.delete(`/admin/users/${id}`);
      
      // Retirer de l'état local
      setUsers((prev) => prev.filter((u) => u.id !== id));
      
      alert("Utilisateur supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert(err.message || "Impossible de supprimer l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((u) => {
    const matchAgency = selectedAgency === "" || u.agency_name === selectedAgency;
    const matchStatus = selectedStatus === "" || u.status === selectedStatus;
    return matchAgency && matchStatus;
  });

  // Statistiques rapides
  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === "pending").length,
    approved: users.filter(u => u.status === "approved").length,
    rejected: users.filter(u => u.status === "rejected").length,
  };

  return (
    <div className="page-container">
      <header className="header">
        <nav className="header-nav">
          <Link to="/Home" className="nav-link">Accueil</Link>
          <Link to="/exploration" className="nav-link">Exploration des Métiers</Link>
          <button onClick={handleLogout} className="btn-logout" style={{ marginLeft: "20px" }}>
            Déconnexion
          </button>
        </nav>
      </header>

      <main className="main-content">
        <h1>Gestion des utilisateurs</h1>

        {/* Statistiques */}
        <div style={{ 
          display: "flex", 
          gap: "20px", 
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            padding: "15px", 
            background: "#f0f0f0", 
            borderRadius: "8px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Total</div>
          </div>
          <div style={{ 
            padding: "15px", 
            background: "#fff3cd", 
            borderRadius: "8px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.pending}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>En attente</div>
          </div>
          <div style={{ 
            padding: "15px", 
            background: "#d4edda", 
            borderRadius: "8px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.approved}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Approuvés</div>
          </div>
          <div style={{ 
            padding: "15px", 
            background: "#f8d7da", 
            borderRadius: "8px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.rejected}</div>
            <div style={{ fontSize: "14px", color: "#666" }}>Rejetés</div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{ 
            padding: "15px", 
            background: "#f8d7da", 
            color: "#721c24",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Filtres */}
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <div>
            <label style={{ marginRight: "8px", fontWeight: "500" }}>
              Agence :
            </label>
            <select 
              value={selectedAgency} 
              onChange={(e) => setSelectedAgency(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Toutes ({agencies.length})</option>
              {agencies.map((a) => (
                <option key={a} value={a}>
                  {a} ({users.filter(u => u.agency_name === a).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: "8px", fontWeight: "500" }}>
              Statut :
            </label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="">Tous</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "pending" ? "En attente" : 
                   s === "approved" ? "Approuvé" : 
                   s === "rejected" ? "Rejeté" : s}
                </option>
              ))}
            </select>
          </div>

          {(selectedAgency || selectedStatus) && (
            <button 
              onClick={() => {
                setSelectedAgency("");
                setSelectedStatus("");
              }}
              style={{ 
                padding: "8px 12px", 
                background: "#6c757d", 
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Résultats filtrés */}
        <div style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
          Affichage de {filteredUsers.length} utilisateur(s)
        </div>

        {/* Tableau */}
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Agence</th>
                <th>Région</th>
                <th>Rôle</th>
                <th>Durée de connexion</th>
                <th>Dernière connexion</th>
                <th>Date d'inscription</th>
                <th>Action</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "30px" }}>
                    {users.length === 0 
                      ? "Aucun utilisateur trouvé" 
                      : "Aucun utilisateur ne correspond aux filtres"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id}>
                      <td>{u.first_name || "—"} {u.last_name || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: 
                            u.status === "pending" ? "#fff3cd" :
                            u.status === "approved" ? "#d4edda" :
                            u.status === "rejected" ? "#f8d7da" : "#e9ecef",
                          color:
                            u.status === "pending" ? "#856404" :
                            u.status === "approved" ? "#155724" :
                            u.status === "rejected" ? "#721c24" : "#495057"
                        }}>
                          {u.status === "pending" ? "En attente" :
                           u.status === "approved" ? "Approuvé" :
                           u.status === "rejected" ? "Rejeté" : u.status}
                        </span>
                      </td>
                      <td>{u.agency_name || "—"}</td>
                      <td>{u.agency_region || "—"}</td>
                      <td>{u.role_name || "—"}</td>
                      <td>{formatDuration(u.total_connection_time)}</td>
                      <td>{formatDateTime(u.last_login)}</td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        {u.status === "pending" ? (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button 
                              onClick={() => handleValidation(u.id, "approved")} 
                              disabled={loading} 
                              className="btn-approve"
                              style={{ fontSize: "12px", padding: "6px 10px" }}
                            >
                              ✓ Approuver
                            </button>
                            <button 
                              onClick={() => handleValidation(u.id, "rejected")} 
                              disabled={loading} 
                              className="btn-reject"
                              style={{ fontSize: "12px", padding: "6px 10px" }}
                            >
                              ✗ Rejeter
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {u.status === "approved" ? "✓ Approuvé" : "✗ Rejeté"}
                          </span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(u.id)} 
                          disabled={loading} 
                          className="btn-delete"
                          style={{ fontSize: "12px", padding: "6px 10px" }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default AdminPage;