// store/use-study-store.ts
import { create } from 'zustand';
import { Lesson, UserStats, ReviewResponse } from '@/types/study';
import { StudyAPI } from '@/lib/api/study';

interface StudyState {
  // Data
  lessons: Lesson[];
  currentIndex: number;
  stats: UserStats | null;
  
  // Session tracking (ephemeral)
  sessionXpGained: number;
  leveledUpThisSession: boolean;
  
  // UI States
  status: 'idle' | 'loading' | 'active' | 'submitting' | 'completed' | 'error';
  isFlipped: boolean;

  // Actions
  initSession: () => Promise<void>;
  flipCard: () => void;
  submitCardRating: (quality: number) => Promise<void>;
  resetSession: () => void;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  lessons: [],
  currentIndex: 0,
  stats: null,
  sessionXpGained: 0,
  leveledUpThisSession: false,
  status: 'idle',
  isFlipped: false,

  initSession: async () => {
    set({ status: 'loading' });
    try {
      const { lessons, userStats } = await StudyAPI.fetchSession();
      set({ 
        lessons, 
        stats: userStats, 
        status: lessons.length > 0 ? 'active' : 'completed',
        currentIndex: 0,
        sessionXpGained: 0,
        leveledUpThisSession: false,
        isFlipped: false
      });
    } catch (error) {
      set({ status: 'error' });
    }
  },

  flipCard: () => set({ isFlipped: true }),

  submitCardRating: async (quality: number) => {
    const { lessons, currentIndex, stats, sessionXpGained } = get();
    const currentLesson = lessons[currentIndex];

    // Block rapid double-clicks
    if (get().status === 'submitting') return;
    set({ status: 'submitting' });

    try {
      // 1. Send to Backend (Source of Truth)
      const reviewData = await StudyAPI.submitReview(currentLesson._id, quality);

      // 2. Calculate next state
      const nextIndex = currentIndex + 1;
      const isDone = nextIndex >= lessons.length;

      // 3. Update Store with Backend's exact numbers
      set({
        stats: stats ? { 
          ...stats, 
          lifetimeXp: reviewData.totalXP,
          level: reviewData.level,
          currentStreak: reviewData.streak 
        } : null,
        sessionXpGained: sessionXpGained + reviewData.xpEarned,
        leveledUpThisSession: get().leveledUpThisSession || reviewData.leveledUp,
        currentIndex: nextIndex,
        isFlipped: false,
        status: isDone ? 'completed' : 'active',
      });

    } catch (error) {
      console.error("Failed to submit review", error);
      set({ status: 'active' }); // Revert so they can try again
    }
  },

  resetSession: () => set({
    lessons: [], currentIndex: 0, stats: null, sessionXpGained: 0,
    leveledUpThisSession: false, status: 'idle', isFlipped: false
  })
}));