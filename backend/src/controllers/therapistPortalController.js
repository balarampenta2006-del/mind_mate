import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import {
  BookingModel,
  UserModel,
  TherapistMessageModel,
  NotificationModel,
} from '../models/index.js';
import { getTherapistPatientReports } from './reportController.js';

export async function getAssignedPatients(req, res) {
  try {
    // A therapist always sees their own patient list; admins may query any.
    let targetTherapistId = req.user?.userId;
    if (req.user?.role === 'admin' && req.query.therapistId) {
      targetTherapistId = req.query.therapistId;
    }

    if (!targetTherapistId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const bookings = await BookingModel.find({ therapistId: targetTherapistId }).lean();
      const userIds = [...new Set(bookings.map((b) => b.userId))];

      let patients = [];
      if (userIds.length > 0) {
        patients = await UserModel.find({ userId: { $in: userIds } })
          .select('-password')
          .lean();
      }

      return res.status(200).json(patients);
    }

    const userIdsWithBookings = db.bookings
      .filter((b) => b.therapistId === targetTherapistId)
      .map((b) => b.userId);

    const uniqueUserIds = [...new Set(userIdsWithBookings)];
    const patients = db.users
      .filter((u) => uniqueUserIds.includes(u.userId))
      .map(({ password, ...rest }) => rest);

    res.status(200).json(patients);
  } catch (error) {
    console.error('getAssignedPatients error:', error);
    res.status(500).json({ message: 'Unable to load patients. Please try again.' });
  }
}

export async function getPatientMessages(req, res) {
  try {
    const { userId } = req.params;

    if (isMongoConnected()) {
      const msgs = await TherapistMessageModel.find({ userId })
        .sort({ createdAt: 1 })
        .lean();
      return res.status(200).json(msgs);
    }

    const list = db.therapistMessages[userId] || [];
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function sendPatientMessage(req, res) {
  try {
    const { userId, text, fromTherapist = true } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ message: 'userId and text are required.' });
    }

    const msgId = `msg_${Date.now()}`;
    const msg = {
      msgId,
      userId,
      fromTherapist: Boolean(fromTherapist),
      text,
      dateTime: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const doc = await TherapistMessageModel.create(msg);
      if (fromTherapist) {
        await NotificationModel.create({
          notificationId: `n_${Date.now()}`,
          userId,
          title: 'New Message from Therapist',
          message: `New message from your therapist: "${text.substring(0, 60)}..."`,
          type: 'advice',
          isRead: false,
        });
      }
      return res.status(201).json(doc.toObject());
    }

    if (!db.therapistMessages[userId]) {
      db.therapistMessages[userId] = [];
    }
    db.therapistMessages[userId].push(msg);

    if (fromTherapist) {
      db.notifications.unshift({
        notificationId: `n_${Date.now()}`,
        userId,
        title: 'New Message from Therapist',
        message: `New message from your therapist: "${text.substring(0, 60)}..."`,
        type: 'advice',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json(msg);
  } catch (error) {
    console.error('sendPatientMessage error:', error);
    res.status(500).json({ message: 'Unable to send the message. Please try again.' });
  }
}

export { getTherapistPatientReports };
