import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET_AUTH = process.env.JWT_SECRET_AUTH;

/**
 * Vérifie que l'utilisateur est authentifié
 * Token provient UNIQUEMENT du cookie HttpOnly (sécurité maximale)
 */
export const verifyToken = (req, res, next) => {
  try {
    // ⚡ Récupération du token depuis le cookie HttpOnly UNIQUEMENT
    const token = req.cookies?.access_token;

    if (!token) {
      console.warn("verifyToken: aucun token trouvé dans les cookies");
      return res.status(401).json({ 
        success: false, 
        message: "Accès non autorisé - Authentification requise" 
      });
    }

    // Vérification et décodage du token
    const decoded = jwt.verify(token, JWT_SECRET_AUTH);
    
    // Vérification que le token contient les informations nécessaires
    if (!decoded.id) {
      console.warn("verifyToken: token invalide (pas d'id)");
      return res.status(401).json({ 
        success: false, 
        message: "Token invalide" 
      });
    }

    // Ajout des infos utilisateur à la requête
    req.user = decoded;
    next();

  } catch (err) {
    console.error("verifyToken error:", err.message);
    
    // Gestion spécifique des erreurs JWT
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Session expirée - Veuillez vous reconnecter",
        expired: true 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token invalide" 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: "Accès non autorisé" 
    });
  }
};

/**
 * Vérifie que l'utilisateur a l'un des rôles autorisés
 * @param {...string} allowedRoles - Liste des rôles autorisés
 */
export const authorizeRole = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());

  return async (req, res, next) => {
    try {
      // Vérification que l'utilisateur est authentifié
      if (!req.user?.id) {
        console.warn("authorizeRole: req.user.id manquant");
        return res.status(401).json({ 
          success: false, 
          message: "Authentification requise" 
        });
      }

      // Si les rôles sont déjà dans req.user (depuis le token), on les utilise
      if (req.user.roles && Array.isArray(req.user.roles)) {
        const userRoles = req.user.roles.map(r => r.toLowerCase().trim());
        const hasAccess = userRoles.some(role => normalizedAllowedRoles.includes(role));

        if (!hasAccess) {
          console.warn(`authorizeRole: user ${req.user.id} n'a pas les droits requis`);
          return res.status(403).json({ 
            success: false, 
            message: "Accès refusé - Droits insuffisants" 
          });
        }

        return next();
      }

      // Sinon, on récupère les rôles depuis la base de données
      const [rows] = await db.query(
        `SELECT r.name AS role_name
         FROM user_role ur
         JOIN role r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [req.user.id]
      );

      if (!rows.length) {
        console.warn(`authorizeRole: aucun rôle trouvé pour user ${req.user.id}`);
        return res.status(403).json({ 
          success: false, 
          message: "Accès refusé - Aucun rôle assigné" 
        });
      }

      const userRoles = rows.map(r => r.role_name.toLowerCase().trim());
      req.user.roles = userRoles; // Sauvegarder pour les middlewares suivants

      const hasAccess = userRoles.some(role => normalizedAllowedRoles.includes(role));

      if (!hasAccess) {
        console.warn(`authorizeRole: user ${req.user.id} (rôles: ${userRoles.join(', ')}) n'a pas accès (requis: ${normalizedAllowedRoles.join(', ')})`);
        return res.status(403).json({ 
          success: false, 
          message: "Accès refusé - Droits insuffisants" 
        });
      }

      next();

    } catch (error) {
      console.error("authorizeRole error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la vérification des droits" 
      });
    }
  };
};

/**
 * Vérifie si l'utilisateur est super_admin ou coordinateur
 */
export const verifyAdminOrCoordinator = async (req, res, next) => {
  try {
    // Vérification que l'utilisateur est authentifié
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentification requise" 
      });
    }

    // Si les rôles sont déjà dans req.user
    if (req.user.roles && Array.isArray(req.user.roles)) {
      const userRoles = req.user.roles.map(r => r.toLowerCase().trim());
      const hasAccess = userRoles.includes("super_admin") || userRoles.includes("coordinateur");

      if (!hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: "Accès refusé - Droits administrateur requis" 
        });
      }

      return next();
    }

    // Sinon, récupération depuis la base de données
    const [rows] = await db.query(
      `SELECT r.name AS role_name
       FROM user_role ur
       JOIN role r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès refusé - Aucun rôle assigné" 
      });
    }

    const userRoles = rows.map(r => r.role_name.toLowerCase().trim());
    req.user.roles = userRoles;

    const hasAccess = userRoles.includes("super_admin") || userRoles.includes("coordinateur");

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès refusé - Droits administrateur requis" 
      });
    }

    next();

  } catch (error) {
    console.error("verifyAdminOrCoordinator error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la vérification des droits" 
    });
  }
};

/**
 * Middleware optionnel pour rafraîchir automatiquement le token si expiré
 */
export const autoRefreshToken = async (req, res, next) => {
  const token = req.cookies?.access_token;
  
  if (!token) {
    return next(); // Pas de token, on continue (sera géré par verifyToken)
  }

  try {
    // Vérifier si le token est expiré
    jwt.verify(token, JWT_SECRET_AUTH);
    next(); // Token valide, on continue
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // Token expiré, tentative de refresh
      const refreshToken = req.cookies?.refresh_token;
      
      if (!refreshToken) {
        return next(); // Pas de refresh token, on laisse verifyToken gérer
      }

      // Ici vous pouvez appeler votre route /refresh en interne
      // Ou rediriger vers /auth/refresh
      console.log("Token expiré, refresh nécessaire");
    }
    next();
  }
};