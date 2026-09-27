import { Router } from 'express';
import {
  getAssignedPatients,
  getPatientMessages,
  sendPatientMessage,
  getTherapistPatientReports,
} from '../controllers/therapistPortalController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// The whole therapist portal is restricted to the therapist role.
router.use(authenticateToken, requireRole(['therapist']));

router.get('/patients', getAssignedPatients);
router.get('/messages/:userId', getPatientMessages);
router.post('/messages', sendPatientMessage);
router.get('/reports/:userId', getTherapistPatientReports);

export default router;
