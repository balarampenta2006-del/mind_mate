import { Router } from 'express';
import { sendSOS, getSOSAlerts, updateSOSStatus } from '../controllers/sosController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/', sendSOS);
router.get('/', getSOSAlerts);
router.put('/:id/status', requireRole(['admin', 'therapist']), updateSOSStatus);

export default router;
