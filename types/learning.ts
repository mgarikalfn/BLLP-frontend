/**
 * 1. Base Shared Types
 */
export type LocalizedString = {
  am: string; // Amharic
  ao: string; // Afan Oromo
};

export enum DifficultyLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

/**
 * 2. Model Specific Types (Lessons, Dialogues, Writing)
 */
export interface VocabularyItem {
  am: string;
  ao: string;
  audioUrl?: string;
  example?: LocalizedString;
}

export interface QuizQuestion {
  question: LocalizedString;
  options: LocalizedString[];
  correctAnswerIndex: number;
}

export interface Lesson {
  _id: string;
  topicId: string;
  order: number;
  title: LocalizedString;
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
  isVerified: boolean;
}

export interface Dialogue {
  _id: string;
  topicId: string;
  scenario: LocalizedString;
  characters: Array<{
    characterId: string;
    name: string;
    avatarUrl?: string;
  }>;
  lines: Array<{
    order: number;
    characterId: string;
    content: LocalizedString;
    isInteractive: boolean;
    question?: LocalizedString;
    options?: LocalizedString[];
    correctAnswerIndex?: number;
  }>;
}

export interface WritingExercise {
  _id: string;
  topicId: string;
  type: "TRANSLATION" | "OPEN_PROMPT";
  prompt: LocalizedString;
  hints?: LocalizedString[];
  sampleAnswer: LocalizedString;
}

/**
 * 3. API Response Payloads (The "Aggregators")
 */

// This matches your GET /api/topics/:topicId/workspace
export interface TopicWorkspaceResponse {
  topic: {
    _id: string;
    title: LocalizedString;
    description?: string;
  };
  userProgress: {
    completedLessons: number; // e.g. 2
    totalLessons: number;     // e.g. 5
    isTopicMastered: boolean;
  };
  lessons: Lesson[];
  dialogues: Dialogue[];
  writingExercises: WritingExercise[];
}

// This matches your Dashboard Summary
export interface DashboardSummaryResponse {
  user: {
    xp: number;
    level: number;
    streak: number;
    tier: string;
  };
  actions: {
    dueCount: number;
    isReviewPriority: boolean;
    recommendedLesson?: Lesson;
  };
  activity: {
    lessonsToday: number;
    reviewsToday: number;
  };
}

/**
 * 4. Generic Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}