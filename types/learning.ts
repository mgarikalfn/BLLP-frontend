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

export interface LegacyQuizQuestion {
  _id?: string;
  question: LocalizedString;
  options: QuizOption[];
  correctAnswerIndex: number;
}

export type QuestionType = "MULTIPLE_CHOICE" | "MATCHING" | "SCRAMBLE" | "CLOZE";

export type LocalizedOrString = LocalizedString | string;

export interface MultipleChoiceQuestionContent {
  question?: LocalizedOrString;
  prompt?: LocalizedOrString;
  options: Array<LocalizedOrString>;
  correctIndex?: number;
  correctAnswerIndex?: number;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingQuestionContent {
  prompt?: LocalizedOrString;
  pairs: MatchingPair[];
}

export interface ScrambleQuestionContent {
  prompt?: LocalizedOrString;
  targetLanguage?: string;
  shuffledWords?: string[];
  correctSentence?: string;
  scrambled?: string[];
  answer?: string;
}

export interface ClozeQuestionContent {
  textBeforeBlank: LocalizedOrString;
  textAfterBlank: LocalizedOrString;
  options: Array<LocalizedOrString>;
  correctAnswer: LocalizedOrString;
}

export type LessonQuestionContent =
  | MultipleChoiceQuestionContent
  | MatchingQuestionContent
  | ScrambleQuestionContent
  | ClozeQuestionContent;

export interface LessonQuestion {
  _id?: string;
  topicId?: string;
  lessonId?: string;
  intendedFor?: "LESSON" | "TOPIC" | "BOTH" | "TEST";
  type: QuestionType;
  content: LessonQuestionContent;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TopicTestClozeContent {
  sentence: LocalizedOrString;
  answer: LocalizedOrString;
}

export type TopicTestQuestionType = "MATCHING" | "CLOZE";

export interface TopicTestQuestion {
  _id: string;
  topicId: string;
  lessonId?: string;
  intendedFor?: "LESSON" | "TOPIC" | "BOTH" | "TEST";
  type: TopicTestQuestionType;
  content: MatchingQuestionContent | TopicTestClozeContent;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TopicTestResponse {
  topicId: string;
  count: number;
  questions: TopicTestQuestion[];
}

export interface Lesson {
  _id: string;
  topicId?: string;
  order: number;
  title: LocalizedString;
  grammarNotes?: LocalizedString;
  vocabulary?: VocabularyItem[];
  dialogue?: Array<{
    _id?: string;
    speaker: string;
    text: LocalizedString;
  }>;
  quiz?: Array<LessonQuestion | LegacyQuizQuestion>;
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
  instruction?: LocalizedString;
  prompt: LocalizedString;
  targetLanguage?: "am" | "ao";
  nativeLanguage?: "am" | "ao";
  hints?: string[] | LocalizedString[];
  sampleAnswer: LocalizedString;
  level?: DifficultyLevel | string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SpeakingExercise {
  _id: string;
  topicId: string;
  title?: LocalizedString | string;
  instruction?: LocalizedString | string;
  expectedText?: LocalizedString | string;
  prompt?: LocalizedString | string;
  script?: LocalizedString | string;
  text?: LocalizedString | string;
  targetLang?: "am" | "ao";
  targetLanguage?: "am" | "ao";
  nativeLanguage?: "am" | "ao";
  level?: DifficultyLevel | string;
  status?: WorkspaceNodeStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type WritingFeedbackStatus = "PERFECT" | "TYPO" | "INCORRECT" | "EVALUATED";

export interface WritingSubmitPayload {
  exerciseId: string;
  topicId: string;
  submittedText: string;
  targetLanguage: "am" | "ao";
  nativeLanguage: "am" | "ao";
}

export interface WritingFeedbackResult {
  isCorrect: boolean;
  status: WritingFeedbackStatus;
  feedback: string;
  sampleAnswer: string;
  attemptId: string;
}

export interface WritingSubmitResponse {
  success: boolean;
  data: WritingFeedbackResult;
  message?: string;
}

/**
 * 3. API Response Payloads (The "Aggregators")
 */

// This matches your GET /api/workspace
export type WorkspaceNodeStatus = "locked" | "active" | "completed";

export interface WorkspaceLesson {
  _id: string;
  title: LocalizedString;
  status: WorkspaceNodeStatus;
  order?: number;
}

export interface WorkspaceDialogue {
  _id: string;
  title: LocalizedString;
  status?: WorkspaceNodeStatus;
  topicId?: string;
}

export interface WorkspaceWritingExercise {
  _id: string;
  title?: LocalizedString | string;
  type?: "TRANSLATION" | "OPEN_PROMPT";
  status?: WorkspaceNodeStatus;
  topicId?: string;
}

export interface WorkspaceSpeakingExercise {
  _id: string;
  title?: LocalizedString | string;
  status?: WorkspaceNodeStatus;
  topicId?: string;
}

export type WorkspaceActivityType = "LESSON" | "DIALOGUE" | "WRITING" | "SPEAKING";

export interface WorkspaceActivity {
  _id: string;
  type: WorkspaceActivityType;
  status: WorkspaceNodeStatus;
  order?: number;
  title?: LocalizedString | string;
  topicId?: string;
  lesson?: WorkspaceLesson;
  dialogue?: WorkspaceDialogue;
  writing?: WorkspaceWritingExercise;
  speaking?: WorkspaceSpeakingExercise;
}

export interface WorkspaceTopic {
  _id: string;
  title: LocalizedString;
  level: string;
  lessons: WorkspaceLesson[];
  dialogues?: WorkspaceDialogue[];
  writingExercises?: WorkspaceWritingExercise[];
  speakingExercises?: WorkspaceSpeakingExercise[];
  writings?: WorkspaceWritingExercise[];
  activities?: WorkspaceActivity[];
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