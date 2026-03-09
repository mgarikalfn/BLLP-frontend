export interface DashboardData {
  user: {
    xp: number
    level: number
    streak: number
    tier: string
  }

  actions: {
    dueReviews: number

    recommendedLesson?: {
      id: string
      title: string
      topicId: string
    }

    continueLesson?: {
      id: string
      title: string
      topicId: string
    }
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
  }
}