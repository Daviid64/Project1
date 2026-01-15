import userModel from '../models/userModel.js';
import pool from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const UserService = {

  /* -----------------------
     CREATE USER
  ------------------------ */
  createUser: async ({ first_name, last_name, email, password, confirmPassword, agency_id, role }) => {
    if (password !== confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }

    if (password.length < 10) {
      throw new Error("Mot de passe trop court (10 caractères minimum)");
    }

    const existingUser = await userModel.findByEmail(email, pool);
    if (existingUser) throw new Error("Utilisateur déjà existant");

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24*60*60*1000); // 24h

    const role_id = await UserService.resolveRoleId(role);
    if (!role_id) throw new Error("Rôle invalide");

    const { userId } = await userModel.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      agency_id,
      role_id,
      token_version: 0
    }, pool);

    return { userId, verificationToken };
  },

  /* -----------------------
     FIND USER BY EMAIL
  ------------------------ */
  findUserByEmail: async (email, includePassword = false) => {
    const user = await userModel.findByEmail(email, pool);
    if (!user) return null;

    if (!includePassword) delete user.password;
    if (user.refresh_token_hash) delete user.refresh_token_hash;

    return user;
  },

  /* -----------------------
     GET USER BY ID
  ------------------------ */
  getUserById: async (id) => {
    const user = await userModel.getById(id, pool);
    if (!user) return null;

    delete user.password;
    if (user.refresh_token_hash) delete user.refresh_token_hash;
    return user;
  },

  /* -----------------------
     UPDATE PASSWORD
  ------------------------ */
  updatePassword: async (id, hashedPassword) => {
    const query = `
      UPDATE users
      SET password = ?, token_version = token_version + 1
      WHERE id = ?
    `;
    return await pool.query(query, [hashedPassword, id]);
  },

  /* -----------------------
     INCREMENT TOKEN VERSION
  ------------------------ */
  incrementTokenVersion: async (id) => {
    return await pool.query(
      "UPDATE users SET token_version = token_version + 1 WHERE id = ?",
      [id]
    );
  },

  /* -----------------------
     STORE REFRESH TOKEN HASH
  ------------------------ */
  storeRefreshToken: async (id, hash) => {
    return await pool.query(
      "UPDATE users SET refresh_token_hash = ? WHERE id = ?",
      [hash, id]
    );
  },

  /* -----------------------
     GET USER ROLES
  ------------------------ */
  getUserRoles: async (userId) => {
    const [rows] = await pool.query(`
      SELECT r.name
      FROM user_role ur
      JOIN role r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [userId]);
    return rows.map(r => r.name);
  },

  /* -----------------------
     RESOLVE ROLE ID
  ------------------------ */
  resolveRoleId: async (roleName) => {
    const [rows] = await pool.query("SELECT id FROM role WHERE name = ?", [roleName]);
    if (!rows.length) throw new Error("Rôle invalide");
    return rows[0].id;
  },

  /* -----------------------
     UPDATE USER
  ------------------------ */
  updateUserById: async (userData, id) => {
    return await userModel.updateById(userData, id, pool);
  },

  /* -----------------------
     DELETE USER
  ------------------------ */
  deleteUserById: async (id) => {
    return await userModel.deleteById(id, pool);
  },

  deleteAllUsers: async () => {
    return await userModel.deleteAll(pool);
  }

};

export default UserService;