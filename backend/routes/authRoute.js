import express from "express";
import UserService from "../services/UserService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/authMiddleware.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { validateBody, registerSchema, loginSchema, resetPasswordSchema } from "../middleware/validation.js";

const router = express.Router();

/* ===========================
   CONFIGURATION COOKIES
=========================== */
const getCookieOptions = (maxAge) => ({
  httpOnly: true,                                    // ⚡ Inaccessible via JavaScript
  secure: process.env.NODE_ENV === "production",    // ⚡ HTTPS uniquement en production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // ⚡ Protection CSRF
  maxAge,
});

/* ===========================
   GET CURRENT USER
=========================== */
router.get("/me", verifyToken, async (req, res) => {
  try {
    // req.user est défini par le middleware authenticateToken
    const userId = req.user.id;
    
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Utilisateur non trouvé" 
      });
    }

    const roles = await UserService.getUserRoles(userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles,
        agency_name: user.agency_name,
        agency_region: user.agency_region
      }
    });
  } catch (err) {
    console.error("Erreur /auth/me:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
});

/* ===========================
   REGISTER
=========================== */
router.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirmPassword, agency_id, role } = req.body;

    // Validation des champs obligatoires
    if (!first_name || !last_name || !email || !password || !confirmPassword || !agency_id || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "Tous les champs sont obligatoires" 
      });
    }

    // Validation de la longueur du mot de passe
    if (password.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Le mot de passe doit contenir au moins 10 caractères" 
      });
    }

    // Validation de la correspondance des mots de passe
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Les mots de passe ne correspondent pas" 
      });
    }

    const { userId } = await UserService.createUser({ 
      first_name, 
      last_name, 
      email, 
      password, 
      confirmPassword, 
      agency_id, 
      role 
    });

    res.status(201).json({
      success: true,
      message: "Votre compte a été créé avec succès. En attente de validation par un administrateur.",
      userId,
    });

  } catch (err) {
    console.error("Register error:", err);
    
    // Gestion des erreurs spécifiques
    if (err.message.includes("existe déjà")) {
      return res.status(409).json({ success: false, message: err.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue lors de l'inscription" 
    });
  }
});

/* ===========================
   LOGIN
=========================== */
router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email et mot de passe requis" 
      });
    }

    const user = await UserService.findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Email ou mot de passe invalide" 
      });
    }

    if (!["approved", "active"].includes(user.status)) {
      const statusMessages = {
        pending: "Votre compte est en attente de validation",
        rejected: "Votre compte a été rejeté",
        suspended: "Votre compte a été suspendu"
      };
      return res.status(403).json({ 
        success: false, 
        message: statusMessages[user.status] || "Compte non actif" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Email ou mot de passe invalide" 
      });
    }

    await UserService.incrementTokenVersion(user.id);

    const roles = await UserService.getUserRoles(user.id);
    const freshUser = await UserService.getUserById(user.id);

    const accessToken = generateAccessToken({ ...freshUser, roles });
    const refreshToken = generateRefreshToken(freshUser);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await UserService.storeRefreshToken(user.id, hashedRefreshToken);
  
    // ⚡ Configuration des cookies
    const cookieOptions = {
      httpOnly: true,
      secure: false, // ⚡ FALSE en développement
      sameSite: "lax", // ⚡ LAX en développement
      path: "/",
    };

    console.log("🍪 Configuration cookies:", cookieOptions);

    res
      .cookie("access_token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie("refresh_token", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ 
        success: true, 
        user: { 
          id: freshUser.id, 
          first_name: freshUser.first_name, 
          last_name: freshUser.last_name, 
          email: freshUser.email, 
          roles,
          agency_name: freshUser.agency_name,
          agency_region: freshUser.agency_region
        } 
      });

    console.log("✅ Cookies envoyés avec succès pour l'utilisateur:", user.email);

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue lors de la connexion" 
    });
  }
});

/* ===========================
   FORGOT PASSWORD
=========================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email requis" 
      });
    }

    const user = await UserService.findUserByEmail(email);
    
    // ⚡ Ne pas révéler si l'email existe (sécurité)
    if (!user) {
      return res.json({ 
        success: true, 
        message: "Si cet email existe, un lien de réinitialisation a été envoyé" 
      });
    }

    // Générer un token de réinitialisation (1 heure)
    const resetToken = jwt.sign(
      { id: user.id, purpose: "reset_password" },
      process.env.JWT_SECRET_RESET,
      { expiresIn: "1h" }
    );

    // Envoyer l'email (à implémenter avec nodemailer)
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ 
      success: true, 
      message: "Si cet email existe, un lien de réinitialisation a été envoyé" 
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue" 
    });
  }
});

/* ===========================
   RESET PASSWORD
=========================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation des champs
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Tous les champs sont requis" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Les mots de passe ne correspondent pas" 
      });
    }

    if (password.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Le mot de passe doit contenir au moins 10 caractères" 
      });
    }

    // Vérification du token
    const payload = jwt.verify(token, process.env.JWT_SECRET_RESET);
    
    if (payload.purpose !== "reset_password") {
      return res.status(400).json({ 
        success: false, 
        message: "Token invalide" 
      });
    }

    // Mise à jour du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    await UserService.updatePassword(payload.id, hashedPassword);

    // Invalider tous les tokens existants
    await UserService.incrementTokenVersion(payload.id);

    res.json({ 
      success: true, 
      message: "Mot de passe réinitialisé avec succès" 
    });

  } catch (err) {
    console.error("Reset password error:", err);
    
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ 
        success: false, 
        message: "Le lien de réinitialisation est invalide ou expiré" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue" 
    });
  }
});

/* ===========================
   LOGOUT
=========================== */
router.post("/logout", verifyToken, async (req, res) => {
  try {
    // Invalider les tokens de l'utilisateur
    await UserService.incrementTokenVersion(req.user.id);

    // Supprimer les cookies
    res
      .clearCookie("access_token", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
      })
      .clearCookie("refresh_token", { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
      })
      .json({ 
        success: true, 
        message: "Déconnexion réussie" 
      });

  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la déconnexion" 
    });
  }
});

/* ===========================
   REFRESH TOKEN
=========================== */
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Refresh token manquant" 
      });
    }

    // Vérification du refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

    // Récupération de l'utilisateur
    const user = await UserService.getUserById(payload.id);

    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: "Utilisateur introuvable" 
      });
    }

    // Vérification de la version du token
    if (user.token_version !== payload.tokenVersion) {
      return res.status(403).json({ 
        success: false, 
        message: "Token révoqué" 
      });
    }

    // Vérification du hash du refresh token
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    
    if (!isRefreshTokenValid) {
      return res.status(403).json({ 
        success: false, 
        message: "Refresh token invalide" 
      });
    }

    // Génération d'un nouveau access token
    const roles = await UserService.getUserRoles(user.id);
    const newAccessToken = generateAccessToken({ ...user, roles });

    // Envoi du nouveau access token
    res
      .cookie("access_token", newAccessToken, getCookieOptions(15 * 60 * 1000))
      .json({ 
        success: true, 
        message: "Token rafraîchi" 
      });

  } catch (err) {
    console.error("Refresh token error:", err);
    
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ 
        success: false, 
        message: "Refresh token invalide ou expiré" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors du rafraîchissement du token" 
    });
  }
});

/* ===========================
   VERIFY TOKEN (pour vérifier si l'utilisateur est connecté)
=========================== */
router.get("/verify", verifyToken, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    const roles = await UserService.getUserRoles(req.user.id);

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        roles,
        agency_name: user.agency_name,
        agency_region: user.agency_region
      } 
    });
  } catch (err) {
    console.error("Verify token error:", err);
    res.status(401).json({ 
      success: false, 
      message: "Non authentifié" 
    });
  }
});

export default router;