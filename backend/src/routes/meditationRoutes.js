import { Router } from 'express';
import {
  getMeditations,
  getMeditationById,
  completeMeditation,
} from '../controllers/meditationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMeditations);
router.post('/:id/complete', completeMeditation);
router.get('/:id', getMeditationById);

export default router;
