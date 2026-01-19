import express from 'express';
import userController from '../controller/userController.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';
import { limiter, rateLimiterUser } from '../middleware/rateLimiters.js';

const router = express.Router();

router.get('/', verifyToken, authorizeRole("super_admin","coordinateur"), limiter, userController.getAll);
router.delete('/:id' , verifyToken, authorizeRole("super_admin","coordinateur"), limiter, userController.deleteById);

export default router;
