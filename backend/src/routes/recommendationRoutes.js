import { Router } from 'express';
import { getRecommendations, getDailyMotivation } from '../controllers/recommendationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getRecommendations);
router.get('/daily-motivation', getDailyMotivation);

export default router;
