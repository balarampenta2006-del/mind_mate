import { Router } from 'express';
import {
  getReports,
  getReportById,
  generateReport,
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id', getReportById);

export default router;
