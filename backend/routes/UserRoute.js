import express from 'express';
import userController from '../controller/userController.js';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, authorizeRole("super_admin","coordinateur"), userController.getAll);

router.delete('/:id' , verifyToken, authorizeRole("super_admin","coordinateur"), userController.deleteById);

export default router;
