import { Router } from 'express';
import { getUsers, updateProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.put('/:id/profile', updateProfile);

export default router;
