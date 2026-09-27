import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { RecommendationModel } from '../models/index.js';
import { resolveReadUserId } from '../middleware/auth.js';

const DAILY_MOTIVATIONS = [
  'Your feelings are valid. You deserve support. 💚',
  'Every small step forward is still progress.',
  "It's okay not to be okay — reaching out is strength.",
  'You have survived difficult days before. You will get through this too.',
  "Healing isn't linear. Be gentle with yourself today.",
  'The bravest thing you can do is ask for help.',
  'Your mental health matters as much as your physical health.',
  'One breath at a time. One moment at a time.',
];

export async function getRecommendations(req, res) {
  try {
    const targetUserId = resolveReadUserId(req);
    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      const results = await RecommendationModel.find({ userId: targetUserId }).lean();
      return res.status(200).json(results);
    }

    const results = db.recommendations.filter((r) => r.userId === targetUserId);
    res.status(200).json(results);
  } catch (error) {
    console.error('getRecommendations error:', error);
    res.status(500).json({ message: 'Unable to load recommendations. Please try again.' });
  }
}

export async function getDailyMotivation(req, res) {
  const idx = new Date().getDate() % DAILY_MOTIVATIONS.length;
  res.status(200).json({ message: DAILY_MOTIVATIONS[idx] });
}
