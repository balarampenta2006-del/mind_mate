import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { MeditationModel, NotificationModel } from '../models/index.js';
import { resolveWriteUserId } from '../middleware/auth.js';

/** Only query `_id` when the value is a real ObjectId — avoids CastErrors. */
function idOrObjectId(id) {
  return mongoose.isValidObjectId(id) ? { _id: id } : null;
}

export async function getMeditations(req, res) {
  try {
    const { category } = req.query;

    if (isMongoConnected()) {
      const query = category ? { category: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } : {};
      const results = await MeditationModel.find(query).lean();
      return res.status(200).json(results);
    }

    let results = db.meditations;
    if (category) {
      results = results.filter(
        (m) => m.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('getMeditations error:', error);
    res.status(500).json({ message: 'Unable to load meditation sessions. Please try again.' });
  }
}

export async function getMeditationById(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const conditions = [{ meditationId: id }, ...(idOrObjectId(id) ? [idOrObjectId(id)] : [])];
      const session = await MeditationModel.findOne({ $or: conditions }).lean();

      if (!session) {
        return res.status(404).json({ message: 'Meditation session not found.' });
      }
      return res.status(200).json(session);
    }

    const session = db.meditations.find((m) => m.meditationId === id);
    if (!session) {
      return res.status(404).json({ message: 'Meditation session not found.' });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error('getMeditationById error:', error);
    res.status(500).json({ message: 'Unable to load the meditation session. Please try again.' });
  }
}

export async function completeMeditation(req, res) {
  try {
    const { id } = req.params;
    const { durationMinutes } = req.body;
    const targetUserId = resolveWriteUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    let session = null;

    if (isMongoConnected()) {
      const conditions = [{ meditationId: id }, ...(idOrObjectId(id) ? [idOrObjectId(id)] : [])];
      session = await MeditationModel.findOne({ $or: conditions }).lean();

      if (!session) {
        return res.status(404).json({ message: 'Meditation session not found.' });
      }

      await MeditationModel.updateOne({ _id: session._id }, { $inc: { completedCount: 1 } });

      await NotificationModel.create({
        notificationId: `n_${Date.now()}`,
        userId: targetUserId,
        title: 'Meditation Completed',
        message: `Great job completing the "${session.title}" session!`,
        type: 'advice',
        isRead: false,
      });

      return res.status(200).json({
        success: true,
        meditationId: session.meditationId,
        userId: targetUserId,
        durationMinutes: durationMinutes || session.duration,
        message: 'Meditation session completed.',
      });
    }

    session = db.meditations.find((m) => m.meditationId === id);
    if (!session) {
      return res.status(404).json({ message: 'Meditation session not found.' });
    }
    session.completedCount = (session.completedCount || 0) + 1;

    db.notifications.unshift({
      notificationId: `n_${Date.now()}`,
      userId: targetUserId,
      title: 'Meditation Completed',
      message: `Great job completing the "${session.title}" session!`,
      type: 'advice',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      meditationId: session.meditationId,
      userId: targetUserId,
      durationMinutes: durationMinutes || session.duration,
      message: 'Meditation session completed.',
    });
  } catch (error) {
    console.error('completeMeditation error:', error);
    res.status(500).json({ message: 'Unable to record the meditation session. Please try again.' });
  }
}
