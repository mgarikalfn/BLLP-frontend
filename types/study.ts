// src/types/study.ts

// 1. New Localization Types specifically for your Afaan Oromo/Amharic platform
export interface LocalizedContent {
  am: string; // Amharic
  ao: string; // Afaan Oromo
}

export interface QuizQuestion {
  question: LocalizedContent;
  options: LocalizedContent[];
  correctAnswerIndex: number;
}

// 2. Updated Lesson Interface to match backend exactly
export interface Lesson {
  _id: string;
  topicId: string;
  order: number;
  content: LocalizedContent;
  isVerified: boolean;
  quiz: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

// 3. The Gamification Stats (What we WANT the backend to send eventually)
export interface UserStats {
  lifetimeXp: number;
  seasonXp: number;
  level: number;
  currentStreak: number;
  seasonTier: string;
  dailyGoalReached: boolean;
}

// 4. The actual Session Response mapping
export interface SessionInitResponse {
  lessons: Lesson[];
  // NOTE: Your backend is currently returning { id, role, iat, exp }. 
  // We will type it as 'any' for a moment until you fix the backend to return real stats.
  userStats: any; 
  breakdown: {
    due: number;
    weak: number;
    new: number;
  };
  total: number;
}

export interface ReviewResponse {
  xpEarned: number;
  totalXP: number;
  level: number;
  leveledUp: boolean;
  streak: number;
  nextReviewDate: string;
}