import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from "cors";
import UserRoute from './routes/UserRoute.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoute.js';
import { limiter } from './middleware/rateLimiters.js';
import cookieParser from 'cookie-parser';
import Joi from 'joi'; // ✅ Ajout de Joi pour validation des entrées

// ⚡ Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ⚡ Trust proxy (utile derrière un proxy type Nginx ou Render)
app.set('trust proxy', 1);

// ⚡ 1. Cookie parser
app.use(cookieParser());

// ⚡ 2. CORS configuration sécurisée
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173", 
      "http://127.0.0.1:5173",
      "https://projet-stage-afec.onrender.com"
    ];
    
    if (!origin) {
      return callback(null, true); // autoriser les requêtes depuis Postman / outils internes
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));

// ⚡ 3. Body parsers
app.use(express.json({ limit: '10kb' })); // ✅ limitation taille JSON pour éviter flood/malware
app.use(express.urlencoded({ extended: true }));

// ⚡ 4. Helmet avec sécurité renforcée
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  referrerPolicy: { policy: "no-referrer" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:5173"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// ⚡ 5. Rate limiter
// ✅ Appliqué sur toutes les routes sensibles
app.use("/users", limiter);
app.use("/admin", limiter);
app.use("/auth", limiter);

// ⚡ 6. Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// ⚡ 7. Validation des entrées avec Joi
// Exemple : middleware pour valider un body JSON pour création utilisateur
export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

// Exemples de schemas Joi
export const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ⚡ 8. Routes principales
app.use("/users", UserRoute);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);

// ⚡ Routes utilitaires pour tests et health check
app.get('/api/verify/:token', (req, res) => {
  const { token } = req.params;
  res.json({ success: true, token });
});

app.get('/api/test-cookie', (req, res) => {
  res.json({ success: true, cookies: req.cookies, message: 'Test des cookies réussi' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend opérationnel', timestamp: new Date().toISOString() });
});

// ⚡ 404 - Route non trouvée
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée", path: req.path });
});

// ⚡ Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.message);
  
  // Erreur CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: 'Origine non autorisée' });
  }
  
  res.status(err.status || 500).json({ success: false, message: err.message || "Erreur interne du serveur" });
});

// ⚡ Démarrage serveur
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  Serveur démarré avec succès              ║
║  URL: http://localhost:${PORT}              ║
║  Env: ${process.env.NODE_ENV || 'development'} ║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
