import crypto from 'crypto';
import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import {
  SosAlertModel,
  UserModel,
  AdminNotificationModel,
  NotificationModel,
} from '../models/index.js';
import { resolveWriteUserId } from '../middleware/auth.js';

const VALID_STATUSES = ['Active', 'Acknowledged', 'Resolved'];

export async function sendSOS(req, res) {
  try {
    const { message, location } = req.body;
    const resolvedUserId = resolveWriteUserId(req);
    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const sosId = `sos_${Date.now()}`;
    const viewToken = crypto.randomBytes(24).toString('hex');

    const newAlert = {
      sosId,
      userId: resolvedUserId,
      message: message || 'Feeling overwhelmed. Need immediate support.',
      location: typeof location === 'object' && location !== null
        ? { latitude: location.latitude || 0, longitude: location.longitude || 0, address: location.address || '' }
        : { latitude: 0, longitude: 0, address: location || 'Bengaluru, Karnataka' },
      status: 'Active',
      triggeredAt: new Date().toISOString(),
      viewToken,
    };

    if (isMongoConnected()) {
      const user = await UserModel.findOne({ userId: resolvedUserId }).lean();
      const userName = user ? user.name : 'User';

      const alertDoc = await SosAlertModel.create({
        ...newAlert,
        userName,
        userEmail: user ? user.email : '',
        userPhone: user ? user.phone : '',
      });

      await AdminNotificationModel.create({
        adminNotificationId: `an_${Date.now()}`,
        title: 'SOS Alert Triggered',
        message: `SOS alert triggered by ${userName}: "${newAlert.message}"`,
        type: 'sos',
        isRead: false,
      });

      await NotificationModel.create({
        notificationId: `n_${Date.now()}`,
        userId: resolvedUserId,
        title: 'SOS Broadcasted',
        message: 'Your SOS alert has been broadcasted to emergency responders and your emergency contacts.',
        type: 'sos',
        isRead: false,
      });

      const alertObj = alertDoc.toObject();
      db.sosAlerts.unshift(alertObj);
      return res.status(201).json(alertObj);
    }

    const user = db.users.find((u) => u.userId === resolvedUserId);
    const userName = user ? user.name : 'User';
    const alertWithUser = { ...newAlert, userName, userEmail: user ? user.email : '', userPhone: user ? user.phone : '' };

    db.sosAlerts.unshift(alertWithUser);

    db.adminNotifications.unshift({
      adminNotificationId: `an_${Date.now()}`,
      title: 'SOS Alert Triggered',
      message: `SOS alert triggered by ${userName}: "${newAlert.message}"`,
      type: 'sos',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.notifications.unshift({
      notificationId: `n_${Date.now()}`,
      userId: resolvedUserId,
      title: 'SOS Broadcasted',
      message: 'Your SOS alert has been broadcasted to emergency responders and your emergency contacts.',
      type: 'sos',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(alertWithUser);
  } catch (error) {
    console.error('sendSOS error:', error);
    res.status(500).json({ message: 'Unable to send the SOS alert. Please try again.' });
  }
}

export async function getSOSAlerts(req, res) {
  try {
    const role = req.user?.role;
    // Admins/therapists see every alert (unless scoped); users see only their own.
    let targetUserId = null;
    if (role === 'admin' || role === 'therapist') {
      targetUserId = req.query.userId || null;
    } else {
      targetUserId = req.user?.userId || null;
      if (!targetUserId) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
    }

    if (isMongoConnected()) {
      const query = targetUserId ? { userId: targetUserId } : {};
      const results = await SosAlertModel.find(query).sort({ triggeredAt: -1 }).lean();
      return res.status(200).json(results);
    }

    let results = db.sosAlerts;
    if (targetUserId) {
      results = results.filter((a) => a.userId === targetUserId);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('getSOSAlerts error:', error);
    res.status(500).json({ message: 'Unable to load SOS alerts. Please try again.' });
  }
}

export async function updateSOSStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status || 'Acknowledged';

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}.` });
    }

    const setPayload = {
      status: newStatus,
      ...(newStatus === 'Resolved' ? { resolvedAt: new Date().toISOString() } : {}),
    };

    if (isMongoConnected()) {
      const alertDoc = await SosAlertModel.findOneAndUpdate(
        { sosId: id },
        { $set: setPayload },
        { new: true }
      ).lean();

      if (!alertDoc) {
        return res.status(404).json({ message: 'SOS alert not found.' });
      }
      return res.status(200).json(alertDoc);
    }

    const alert = db.sosAlerts.find((a) => a.sosId === id);
    if (!alert) {
      return res.status(404).json({ message: 'SOS alert not found.' });
    }

    Object.assign(alert, setPayload);
    res.status(200).json(alert);
  } catch (error) {
    console.error('updateSOSStatus error:', error);
    res.status(500).json({ message: 'Unable to update the SOS alert. Please try again.' });
  }
}
