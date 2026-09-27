import { db } from '../data/store.js';
import { isMongoConnected } from '../config/database.js';
import { ChatMessageModel } from '../models/index.js';
import { resolveReadUserId, resolveWriteUserId } from '../middleware/auth.js';

const AI_RESPONSES = {
  anxious: [
    "It sounds like anxiety is feeling heavy right now. Remember to take a slow, deep breath in... and let it out gently. Would you like to try a 4-7-8 breathing exercise together?",
    "I hear how overwhelming things feel right now. Anxiety is tough, but you are safe in this moment. What is one small thing around you that brings you comfort?",
    "Thank you for sharing how you feel. Acknowledging your anxiety is a brave step. You don't have to carry this alone.",
  ],
  sad: [
    "I'm so sorry you're feeling down. Your sadness is valid, and it's okay to feel this way. Be gentle with yourself today.",
    "It takes courage to express sadness. I'm here with you. What would feel most supportive right now — talking more, or just having a quiet moment?",
  ],
  overwhelmed: [
    "That is a lot to carry at once. When everything feels like too much, focus only on the next single step. What is one small thing we can unpack together?",
    "Feeling overwhelmed is your mind's signal to pause and rest. Let's take a minute together. You don't have to solve everything today.",
  ],
  hopeful: [
    "It's wonderful to hear a sense of hope and progress! Every step forward, no matter how small, is worth celebrating.",
    "That sounds really promising! Recognizing the bright spots helps build resilience. How can you continue to nurture this positive momentum?",
  ],
  calm: [
    "It's great to hear you are in a calm headspace. Holding onto these peaceful moments helps build a strong foundation for your wellbeing.",
    "Enjoy this sense of tranquility. Take a moment to appreciate how good it feels to feel centered.",
  ],
  neutral: [
    "Thank you for sharing. I'm here to listen whenever you'd like to talk about your day, your feelings, or any challenges you're experiencing.",
    "I hear you. How has your day been treating you overall? Feel free to share anything on your mind.",
  ],
};

function analyzeEmotion(text = '') {
  const lower = text.toLowerCase();
  if (lower.match(/anxious|panic|worry|scared|nervous|stress|fear|racing/)) return 'anxious';
  if (lower.match(/sad|depressed|cry|unhappy|lonely|down|hopeless|hurt/)) return 'sad';
  if (lower.match(/overwhelm|too much|drowning|pressure|burnout|exhausted|tired/)) return 'overwhelmed';
  if (lower.match(/hope|better|excited|good|happy|progress|grateful|thank/)) return 'hopeful';
  if (lower.match(/calm|peace|relax|meditat|zen|rested|quiet/)) return 'calm';
  return 'neutral';
}

export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const resolvedUserId = resolveWriteUserId(req);

    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const emotion = analyzeEmotion(message);
    const options = AI_RESPONSES[emotion] || AI_RESPONSES.neutral;
    const reply = options[Math.floor(Math.random() * options.length)];
    const chatId = `c_${Date.now()}`;

    const chatEntry = {
      chatId,
      userId: resolvedUserId,
      message,
      reply,
      emotion,
      dateTime: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      const doc = await ChatMessageModel.create(chatEntry);
      const chatObj = doc.toObject();
      db.chatHistory.push(chatObj);
      return res.status(200).json(chatObj);
    }

    db.chatHistory.push(chatEntry);
    res.status(200).json(chatEntry);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: 'Unable to send the message. Please try again.' });
  }
}

export async function getChatHistory(req, res) {
  try {
    const resolvedUserId = resolveReadUserId(req);
    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      let history = await ChatMessageModel.find({ userId: resolvedUserId })
        .sort({ createdAt: 1 })
        .lean();

      if (history.length === 0) {
        history = db.chatHistory.filter((c) => c.userId === resolvedUserId);
      }
      return res.status(200).json(history);
    }

    const history = db.chatHistory.filter((c) => c.userId === resolvedUserId);
    res.status(200).json(history);
  } catch (error) {
    console.error('getChatHistory error:', error);
    res.status(500).json({ message: 'Unable to load chat history. Please try again.' });
  }
}

export async function clearChatHistory(req, res) {
  try {
    const resolvedUserId = resolveWriteUserId(req);
    if (!resolvedUserId) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (isMongoConnected()) {
      await ChatMessageModel.deleteMany({ userId: resolvedUserId });
    }

    db.chatHistory = db.chatHistory.filter((c) => c.userId !== resolvedUserId);
    res.status(200).json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('clearChatHistory error:', error);
    res.status(500).json({ message: 'Unable to clear chat history. Please try again.' });
  }
}
