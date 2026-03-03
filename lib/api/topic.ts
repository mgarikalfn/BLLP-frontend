// src/lib/api/topics.ts

export interface Topic {
  _id: string;
  title: { am: string; ao: string };
  description: { am: string; ao: string };
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  slug: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const TopicAPI = {
  getAllTopics: async (): Promise<Topic[]> => {
    const res = await fetch(`${API_BASE}/topics`);
    if (!res.ok) throw new Error("Failed to fetch topics");
    return res.json();
  },
};