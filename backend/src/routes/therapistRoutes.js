import { Router } from 'express';
import {
  getTherapists,
  getTherapistById,
  getTherapistAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  updateTherapistProfile,
} from '../controllers/therapistController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTherapists);
router.get('/:id', getTherapistById);
router.get('/:id/availability', getTherapistAvailability);

// Availability management + self profile updates are therapist-only.
router.post('/availability', requireRole(['therapist']), addAvailabilitySlot);
router.delete('/availability/:slotId', requireRole(['therapist']), removeAvailabilitySlot);
router.put('/:id/profile', requireRole(['therapist']), updateTherapistProfile);

export default router;
