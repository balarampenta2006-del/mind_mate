import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { MoodModel } from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

/** Most recent N moods for a single user, newest first. */
function userMoodsFor(userId) {
  return db.moods
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

export async function getMoods(req, res) {
  try {
    const { days = 30 } = req.query;
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days, 10));
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    if (isMongoConnected()) {
      const results = await MoodModel.find({
        userId: targetUserId,
        date: { $gte: cutoffDate },
      })
        .sort({ date: -1 })
        .lean();

      if (results.length > 0) return res.status(200).json(results);

      // No moods inside the window — fall back to the user's latest entries.
      const latest = await MoodModel.find({ userId: targetUserId }).sort({ date: -1 }).limit(7).lean();
      return res.status(200).json(latest);
    }

    let results = db.moods.filter(
      (m) => m.userId === targetUserId && (m.date || m.createdAt || '') >= cutoffDate
    );
    results = results.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    if (results.length === 0) {
      results = userMoodsFor(targetUserId).slice(0, 7);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('getMoods error:', error);
    res.status(500).json({ message: 'Unable to load moods. Please try again.' });
  }
}

export async function logMood(req, res) {
  try {
    const {
      moodType,
      mood,
      moodLevel,
      intensity,
      note,
      notes,
      date,
    } = req.body;

    const resolvedUserId = resolveWriteUserId(req);
    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const resolvedType = moodType || mood || 'Calm';
    const resolvedLevel = Number(moodLevel || intensity || 5);
    const resolvedNote = note || notes || '';
    const resolvedDate = date || new Date().toISOString().slice(0, 10);
    const moodId = `m_${Date.now()}`;

    if (isMongoConnected()) {
      const newMoodDoc = await MoodModel.create({
        moodId,
        userId: resolvedUserId,
        moodType: resolvedType,
        mood: resolvedType,
        moodLevel: resolvedLevel,
        intensity: resolvedLevel,
        note: resolvedNote,
        notes: resolvedNote,
        date: resolvedDate,
      });

      const newMoodObj = newMoodDoc.toObject();
      db.moods.unshift(newMoodObj);
      return res.status(201).json(newMoodObj);
    }

    const newMood = {
      moodId,
      userId: resolvedUserId,
      moodType: resolvedType,
      moodLevel: resolvedLevel,
      note: resolvedNote,
      date: resolvedDate,
    };

    db.moods.unshift(newMood);
    res.status(201).json(newMood);
  } catch (error) {
    console.error('logMood error:', error);
    res.status(500).json({ message: 'Unable to log the mood. Please try again.' });
  }
}

export async function getMoodTrend(req, res) {
  try {
    const { period = '30d' } = req.query;
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const days = period === '7d' || period === 'weekly' ? 7 : period === '90d' ? 90 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    if (isMongoConnected()) {
      let history = await MoodModel.find({
        userId: targetUserId,
        date: { $gte: cutoffDate },
      })
        .sort({ date: 1 })
        .lean();

      if (!history.length) {
        history = await MoodModel.find({ userId: targetUserId })
          .sort({ date: -1 })
          .limit(days)
          .lean();
        history.reverse();
      }

      const trend = history.map((m) => ({
        date: m.date || m.createdAt,
        level: m.moodLevel || m.intensity || 5,
        type: m.moodType || m.mood || 'Calm',
      }));

      return res.status(200).json(trend);
    }

    const userMoods = userMoodsFor(targetUserId).slice().reverse();
    const history = userMoods.filter((m) => (m.date || m.createdAt || '') >= cutoffDate);

    const trend = (history.length ? history : userMoods.slice(-days)).map((m) => ({
      date: m.date,
      level: m.moodLevel,
      type: m.moodType,
    }));

    res.status(200).json(trend);
  } catch (error) {
    console.error('getMoodTrend error:', error);
    res.status(500).json({ message: 'Unable to load the mood trend. Please try again.' });
  }
}

export async function getLatestMood(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const latest = await MoodModel.findOne({ userId: targetUserId }).sort({ date: -1 }).lean();
      return res.status(200).json(latest || null);
    }

    const latest = userMoodsFor(targetUserId)[0] || null;
    res.status(200).json(latest);
  } catch (error) {
    console.error('getLatestMood error:', error);
    res.status(500).json({ message: 'Unable to load the latest mood. Please try again.' });
  }
}
