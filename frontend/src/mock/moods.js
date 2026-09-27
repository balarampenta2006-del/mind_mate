import { MoodType } from '@/constants/enums.js';

/** Generate 30 days of mood history for demo user u1 */
function genMoods() {
  const types = Object.values(MoodType);
  const notes = [
    'Feeling better after a walk.',
    'Work was stressful today.',
    'Good session with friends.',
    'Couldn\'t sleep well last night.',
    '',
    'Meditation helped a lot today.',
    'Feeling overwhelmed with deadlines.',
    'Had a calm, productive morning.',
    '',
    'Watched a nice movie, relaxed.',
  ];
  const moods = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    moods.push({
      moodId: `m${30 - i}`,
      userId: 'u1',
      moodType: types[Math.floor(Math.random() * types.length)],
      moodLevel: Math.floor(Math.random() * 7) + 3, // 3–9
      note: notes[Math.floor(Math.random() * notes.length)],
      date: d.toISOString().slice(0, 10),
    });
  }
  return moods;
}

/** @type {import('@/types').Mood[]} */
export const MOODS = genMoods();
