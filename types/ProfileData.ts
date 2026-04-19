export type TargetLanguage = "AMHARIC" | "OROMO";
export type LearningDirection = "AM_TO_OR" | "OR_TO_AM";

export interface ProfileIdentity {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  joinedAt: string;
}

export interface ProfileLearningSettings {
  targetLanguage: TargetLanguage;
  learningDirection: LearningDirection;
}

export interface ProfileStats {
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  todayProgress: string;
  tier: string;
}

export interface ProfileAchievements {
  badges: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    icon?: string;
  }>;
}

export interface ProfileCourseProgress {
  completedTopics: number;
  completedLessons: number;
  currentTopicName: string;
}

export interface ProfileData {
  identity: ProfileIdentity;
  learningSettings: ProfileLearningSettings;
  stats: ProfileStats;
  achievements: ProfileAchievements;
  courseProgress: ProfileCourseProgress;
}

export interface UpdateProfilePayload {
  avatarUrl?: string;
  bio?: string;
  learningDirection: LearningDirection;
  targetLanguage: TargetLanguage;
}
