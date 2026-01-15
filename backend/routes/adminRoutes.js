import express from 'express'
import {verifyToken, authorizeRole} from '../middleware/authMiddleware.js'
import {getAllUsers, validateUser, deleteUser} from '../controller/adminController.js'

const router = express.Router();

router.get("/users", verifyToken,authorizeRole("super_admin"), getAllUsers);

router.patch('/users/:id/validate', verifyToken, authorizeRole("super_admin", "coordinateur"), validateUser);

router.delete('/users/:id', verifyToken, authorizeRole("super_admin", "coordinateur"), deleteUser);

export default router