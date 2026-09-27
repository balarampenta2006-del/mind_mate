import { Router } from 'express';
import {
  getAdminStats,
  getAdminMoods,
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUser,
  deactivateUser,
  reactivateUser,
  removeUser,
  getAdminTherapists,
  getAdminTherapistDetail,
  onboardTherapist,
  updateAdminTherapist,
  deactivateTherapist,
  reactivateTherapist,
  removeTherapist,
  getAdminNotifications,
  markAdminNotificationRead,
  broadcastNotification,
} from '../controllers/adminController.js';
import { getAllAdminBookings } from '../controllers/bookingController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Every admin endpoint requires a valid JWT with the admin role.
router.use(authenticateToken, requireRole(['admin']));

// Stats
router.get('/stats', getAdminStats);

// All mood logs (analytics / reports)
router.get('/moods', getAdminMoods);

// Users management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetail);
router.put('/users/:id', updateAdminUser);
router.post('/users/:id/deactivate', deactivateUser);
router.post('/users/:id/reactivate', reactivateUser);
router.delete('/users/:id', removeUser);

// Therapists management
router.get('/therapists', getAdminTherapists);
router.post('/therapists', onboardTherapist);
router.get('/therapists/:id', getAdminTherapistDetail);
router.put('/therapists/:id', updateAdminTherapist);
router.post('/therapists/:id/deactivate', deactivateTherapist);
router.post('/therapists/:id/reactivate', reactivateTherapist);
router.delete('/therapists/:id', removeTherapist);

// All bookings
router.get('/bookings', getAllAdminBookings);

// Admin Notifications
router.get('/notifications', getAdminNotifications);
router.put('/notifications/:id/read', markAdminNotificationRead);
router.post('/notifications/broadcast', broadcastNotification);

export default router;
