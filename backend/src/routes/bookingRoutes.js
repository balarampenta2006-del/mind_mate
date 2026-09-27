import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
} from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

export default router;
