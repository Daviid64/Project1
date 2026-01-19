import Joi from 'joi';

// Middleware réutilisable
export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

// Schéma pour l'inscription
export const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(30).required(),
  last_name: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(10).required(),
  confirmPassword: Joi.ref('password'), // ⚡ doit correspondre au password
  agency_id: Joi.number().required(),
  role: Joi.string().valid('super_admin', 'coordinateur', 'user').required()
});
// Schéma pour la connexion
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(10).required()
});

// Schéma pour la réinitialisation du mot de passe
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});