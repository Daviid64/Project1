import db from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.status,
        u.created_at,
        u.last_login,
        u.total_connection_time,
        u.agency_id,
        a.name AS agency_name,
        a.region AS agency_region,
        COALESCE(GROUP_CONCAT(DISTINCT r.name SEPARATOR ', '), '') AS role_name 
      FROM users u
      LEFT JOIN agencies a ON u.agency_id = a.id
      LEFT JOIN user_role ur ON ur.user_id = u.id
      LEFT JOIN role r ON ur.role_id = r.id
      WHERE u.id NOT IN (
        SELECT ur2.user_id 
        FROM user_role ur2 
        JOIN role r2 ON ur2.role_id = r2.id 
        WHERE r2.name IN ('super_admin', 'coordinateur')
      )
      GROUP BY 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.status, 
        u.created_at, 
        u.last_login,
        u.total_connection_time,
        u.agency_id,
        a.name,
        a.region
      ORDER BY u.created_at DESC`
    );

    console.log("Backend - Utilisateurs récupérés:", users.length);
    if (users.length > 0) {
      console.log("Backend - Premier utilisateur:", users[2]);
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur getAllUsers:", err);
    res.status(500).json({ message: "Erreur interne" });
  }
};

export const validateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Requête invalide" });
    }

    const [userRows] = await db.query(
      `SELECT u.first_name, u.email, r.name as role
       FROM users u
       LEFT JOIN user_role ur ON ur.user_id = u.id
       LEFT JOIN role r ON ur.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );

    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ message: "Aucun résultat" });
    }

    await db.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);

    res.status(200).json({ message: "Mise à jour effectuée" });
  } catch (error) {
    console.error("Erreur validateUser:", error);
    res.status(500).json({ message: "Erreur interne" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [userRows] = await db.query(
      `SELECT 
        u.id, 
        u.first_name, 
        u.email, 
        COALESCE(GROUP_CONCAT(DISTINCT r.name SEPARATOR ', '), '') AS role_name
       FROM users u
       LEFT JOIN user_role ur ON ur.user_id = u.id
       LEFT JOIN role r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id, u.first_name, u.email`,
      [id]
    );

    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ message: "Aucun résultat" });
    }

    // Supprimer d'abord les relations dans user_role
    await db.query("DELETE FROM user_role WHERE user_id = ?", [id]);
    
    // Puis supprimer l'utilisateur
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.status(200).json({ message: "Suppression effectuée" });
  } catch (err) {
    console.error("Erreur deleteUser:", err);
    res.status(500).json({ message: "Erreur interne" });
  }
};