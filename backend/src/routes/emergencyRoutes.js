import { Router } from 'express';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../controllers/emergencyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmergencyContacts);
router.post('/', addEmergencyContact);
router.put('/:id', updateEmergencyContact);
router.delete('/:id', deleteEmergencyContact);

export default router;
