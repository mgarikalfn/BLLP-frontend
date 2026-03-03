// src/lib/api/learn.ts

import { Lesson } from "@/types/study";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface TopicResponse {
  topic: {
    id: string;
    title: { am: string; ao: string };
  };
  totalLessons: number;
  lessons: Lesson[];
}

export const LearnAPI = {
  /**
   * Fetches the structured learning path for a specific topic
   */
  getTopicLessons: async (topicId: string, token: string): Promise<TopicResponse> => {
    const res = await fetch(`${API_BASE}/learn/topic/${topicId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch topic lessons");
    }

    return res.json();
  },

  /**
   * Finalizes a lesson and pushes it into the SM-2 Review Engine queue
   */
  completeLesson: async (lessonId: string, token: string) => {
    const res = await fetch(`${API_BASE}/learn/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lessonId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to complete lesson");
    }

    return res.json();
  },
};