export type ContentType = 'text' | 'audio' | 'video' | 'dialogue';

export interface LessonContent {
  type: ContentType;
  data: string;
}

export interface Lesson {
  _id: string;
  frontContent: LessonContent;
  backContent: LessonContent;
  easeFactor?: number;
  repetition?: number;
}

export interface UserStats {
  lifetimeXp: number;
  seasonXp: number;
  level: number;
  currentStreak: number;
  seasonTier: string;
  dailyGoalReached: boolean;
}

export interface SessionInitResponse {
  lessons: Lesson[];
  userStats: UserStats;
}

export interface ReviewResponse {
  xpEarned: number;
  totalXP: number;
  level: number;
  leveledUp: boolean;
  streak: number;
  nextReviewDate: string;
}