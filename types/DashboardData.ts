import { LocalizedString } from "./learning";

interface DashboardLessonRef {
  id: string;
  title: LocalizedString;
  order?: number;
  topicId?: string;
  topic?: {
    id: string;
    title: LocalizedString;
    level: string;
  };
}

export interface DashboardData {
  user: {
    xp: number
    level: number
    streak: number
    tier: string
  }

  actions: {
    dueCount: number
    isReviewPriority: boolean
    reviewUrgency: "none" | "low" | "medium" | "high" | "critical"

    recommendedLesson?: DashboardLessonRef
    continueLesson?: DashboardLessonRef
  }

  insights: {
    weakTopics: {
      _id: string
      weakCount: number
    }[]

    mastery: number
  }

  activity: {
    lessonsToday: number
    reviewsToday: number
    dailyGoal: number
    todayCount: number
  }
}