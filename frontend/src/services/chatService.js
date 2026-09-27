/**
 * @fileoverview AI Chat service.
 *
 * BACKEND DEPENDENCIES:
 *   POST   /chat/message            → AIChat  (AI reply + emotion tag)
 *   GET    /chat/history?userId=    → AIChat[]
 *   DELETE /chat/history?userId=    → { success: true }
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';

const AI_RESPONSES = [
  "It sounds like you're going through a challenging time. It's completely okay to feel this way. Would you like to try a short breathing exercise together?",
  "Thank you for sharing that with me. Your feelings are valid. What would help you feel a little more grounded right now?",
  "I hear you. Acknowledging how you feel is already a brave step. You mentioned feeling anxious — has anything specific happened recently?",
  "That's a lot to carry. Remember, you don't have to face this alone. Have you been able to speak with someone you trust?",
  "It takes courage to talk about how you're really feeling. I'm here with you. What would feel supportive right now?",
  "I understand. Sometimes just naming the feeling — like 'I feel overwhelmed' — can help ease it a little. What does your body feel like right now?",
];

const EMOTION_TAGS = ['anxious', 'sad', 'neutral', 'hopeful', 'overwhelmed', 'calm'];

let _history = [
  {
    chatId: 'c0',
    userId: 'u1',
    message: "Hello, I've been feeling quite anxious lately.",
    reply: "Thank you for sharing that with me. Anxiety can be really difficult to carry. I'm here to listen — would you like to tell me more about what's been on your mind?",
    emotion: 'anxious',
    dateTime: new Date(Date.now() - 3_600_000).toISOString(),
  },
];

/**
 * @param {{ userId:string, message:string }} payload
 * @returns {Promise<import('@/types').AIChat>}
 */
export async function sendMessage({ userId, message }) {
  if (USE_MOCK) {
    await mockDelay(1200);
    const entry = {
      chatId: `c_${Date.now()}`,
      userId,
      message,
      reply: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
      emotion: EMOTION_TAGS[Math.floor(Math.random() * EMOTION_TAGS.length)],
      dateTime: new Date().toISOString(),
    };
    _history = [..._history, entry];
    return entry;
  }
  return apiRequest('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ userId, message }),
  });
}

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').AIChat[]>}
 */
export async function getChatHistory(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return _history.filter((h) => h.userId === userId);
  }
  return apiRequest(`/chat/history?userId=${encodeURIComponent(userId)}`);
}

/**
 * @param {string} userId
 * @returns {Promise<{ success: boolean }>}
 */
export async function clearChatHistory(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    _history = _history.filter((h) => h.userId !== userId);
    return { success: true };
  }
  return apiRequest(`/chat/history?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
