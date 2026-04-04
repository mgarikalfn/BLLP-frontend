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
  _id?: string;
  am: string;
  ao: string;
  audioUrl?: {
    am?: string;
    ao?: string;
  };
  example?: {
    am: string;
    ao: string;
    audioUrl?: {
      am?: string;
      ao?: string;
    };
  };
}

export interface QuizOption extends LocalizedString {
  _id?: string;
}

export interface QuizQuestion {
  _id?: string;
  question: LocalizedString;
  options: QuizOption[];
  correctAnswerIndex: number;
}

export interface Lesson {
  _id: string;
  topicId?: string;
  order: number;
  title: LocalizedString;
  vocabulary?: VocabularyItem[];
  quiz?: QuizQuestion[];
  isVerified?: boolean;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Dialogue {
  _id: string;
  topicId: string;
  level?: DifficultyLevel;
  isVerified?: boolean;
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

// This matches your GET /api/workspace
export interface WorkspaceLesson {
  _id: string;
  title: LocalizedString;
  status: 'locked' | 'active' | 'completed';
}

export interface WorkspaceDialogue {
  _id: string;
  title: LocalizedString;
}

export interface WorkspaceTopic {
  _id: string;
  title: LocalizedString;
  level: string;
  lessons: WorkspaceLesson[];
  dialogues?: WorkspaceDialogue[];
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
  isCompleted: boolean;
}

export interface TopicWorkspaceResponse {
  topics: WorkspaceTopic[];
  pagination: {
    currentPage: number;
    hasMore: boolean;
    nextPage: number | null;
  };
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