import { Router } from 'express';
import { getMoods, logMood, getMoodTrend, getLatestMood } from '../controllers/moodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMoods);
router.post('/', logMood);
router.get('/trend', getMoodTrend);
router.get('/latest', getLatestMood);

export default router;
