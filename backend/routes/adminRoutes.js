import express from 'express'
import {verifyToken, authorizeRole} from '../middleware/authMiddleware.js'
import {getAllUsers, validateUser, deleteUser} from '../controller/adminController.js'
import {limiter} from '../middleware/rateLimiters.js'

const router = express.Router();

router.get("/users", verifyToken,authorizeRole("super_admin"), getAllUsers);

router.patch('/users/:id/validate', verifyToken, authorizeRole("super_admin", "coordinateur"), validateUser);

router.delete('/users/:id', verifyToken, authorizeRole("super_admin", "coordinateur"), limiter, deleteUser);

export default router