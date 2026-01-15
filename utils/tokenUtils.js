import jwt from "jsonwebtoken";

/**
 * Génère un access token (15 min)
 * @param {Object} user - Objet utilisateur { id, roles, token_version }
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      roles: user.roles || [],
      tokenVersion: user.token_version || 0, // harmonisé avec refresh token
    },
    process.env.JWT_SECRET_AUTH,
    { expiresIn: "15m" }
  );
};

/**
 * Génère un refresh token (7 jours)
 * @param {Object} user - Objet utilisateur { id, token_version }
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.token_version || 0, // harmonisé
    },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: "7d" }
  );
};
