// import crypto from 'crypto';

const userModel = {

  // Créer un utilisateur
  create: async (userData, pool) => {
    const { first_name, last_name, email, password, role_id, verificationToken, agency_id } = userData;

    // Insertion utilisateur
    const sqlUser = `
      INSERT INTO users (first_name, last_name, email, password, status, verificationToken, agency_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())
    `;
    const [result] = await pool.query(sqlUser, [first_name, last_name, email, password, verificationToken, agency_id]);
    const userId = result.insertId;

    // Assigner un rôle par défaut si non fourni
    let assignedRoleId = role_id;
    if (!assignedRoleId) {
      const [rows] = await pool.query('SELECT id FROM role WHERE name = ?', ['stagiaire']);
      assignedRoleId = rows[0].id;
    }

    const sqlRole = `
      INSERT INTO user_role (user_id, role_id, assigned_at)
      VALUES (?, ?, NOW())
    `;
    await pool.query(sqlRole, [userId, assignedRoleId]);
     
    return { userId };
  },

  // Chercher un utilisateur par email
  findByEmail: async (email, pool) => {
    const sql = `
      SELECT u.*, GROUP_CONCAT(r.name) AS roles
      FROM users u
      LEFT JOIN user_role ur ON ur.user_id = u.id
      LEFT JOIN role r ON ur.role_id = r.id
      WHERE u.email = ?
      GROUP BY u.id
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0] || null;
  },

  // Récupérer tous les utilisateurs
  getAll: async (pool) => {
    const sql = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.agency_id,
             u.created_at, u.updated_at,
             GROUP_CONCAT(r.name) AS roles
      FROM users u
      LEFT JOIN user_role ur ON ur.user_id = u.id
      LEFT JOIN role r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Récupérer un utilisateur par ID
  getById: async (id, pool) => {
    const sql = `
      SELECT u.*, GROUP_CONCAT(r.name) AS roles
      FROM users u
      LEFT JOIN user_role ur ON ur.user_id = u.id
      LEFT JOIN role r ON ur.role_id = r.id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  // Supprimer un utilisateur par ID
  deleteById: async (id, pool) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  },

  // Supprimer tous les utilisateurs
  deleteAll: async (pool) => {
    const sql = `DELETE FROM users`;
    const [result] = await pool.query(sql);
    return result.affectedRows;
  },

  // Mettre à jour un utilisateur par ID
  updateById: async (userData, id, pool) => {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(userData);
    values.push(id);

    const sql = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.query(sql, values);
    return result.affectedRows;
  },

  // Mettre à jour le mot de passe d'un utilisateur
  updatePassword: async (id, hashedPassword, pool) => {
    const sql = `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`;
    const [result] = await pool.query(sql, [hashedPassword, id]);
    return result.affectedRows;
  }

};

export default userModel;
