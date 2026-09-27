import { MeditationCategory } from '@/constants/enums.js';

/** @type {import('@/types').Meditation[]} */
export const MEDITATION_SESSIONS = [
  {
    meditationId: 'med1',
    title: 'Morning Calm',
    description: 'Begin your day with a gentle 10-minute breathing exercise to set a peaceful intention for the hours ahead.',
    duration: 10,
    category: MeditationCategory.BREATHING,
    audioUrl: null,
  },
  {
    meditationId: 'med2',
    title: 'Deep Sleep Relaxation',
    description: 'A soothing body-scan and progressive relaxation practice designed to ease you into restful sleep.',
    duration: 20,
    category: MeditationCategory.SLEEP,
    audioUrl: null,
  },
  {
    meditationId: 'med3',
    title: 'Anxiety Release',
    description: 'Grounding techniques and slow, controlled breathing to release anxious energy and restore calm.',
    duration: 15,
    category: MeditationCategory.ANXIETY,
    audioUrl: null,
  },
  {
    meditationId: 'med4',
    title: 'Focus & Clarity',
    description: 'A mindful concentration practice to sharpen attention and clear mental fog before important tasks.',
    duration: 12,
    category: MeditationCategory.FOCUS,
    audioUrl: null,
  },
  {
    meditationId: 'med5',
    title: 'Present Moment Awareness',
    description: 'A classic mindfulness practice bringing full attention to the present moment through breath and body awareness.',
    duration: 18,
    category: MeditationCategory.MINDFULNESS,
    audioUrl: null,
  },
  {
    meditationId: 'med6',
    title: 'Stress Melt',
    description: 'Release physical and mental tension with this gentle guided body-scan and visualisation practice.',
    duration: 25,
    category: MeditationCategory.STRESS,
    audioUrl: null,
  },
  {
    meditationId: 'med7',
    title: '4-7-8 Breathing',
    description: 'A powerful breathing technique that activates the parasympathetic nervous system for instant calm.',
    duration: 8,
    category: MeditationCategory.BREATHING,
    audioUrl: null,
  },
  {
    meditationId: 'med8',
    title: 'Evening Wind-Down',
    description: 'A 15-minute guided practice to transition from the busyness of the day to peaceful rest.',
    duration: 15,
    category: MeditationCategory.SLEEP,
    audioUrl: null,
  },
];
