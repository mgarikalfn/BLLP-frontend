// lib/api/study.ts
import { SessionInitResponse, ReviewResponse } from "@/types/study";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const StudyAPI = {
  fetchSession: async (): Promise<SessionInitResponse> => {
    // Assuming you have an auth token mechanism (e.g., from cookies or Clerk)
    const res = await fetch(`${API_BASE}/study/session`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (!res.ok) throw new Error("Failed to fetch session");
    return res.json();
  },

  submitReview: async (lessonId: string, quality: number): Promise<ReviewResponse> => {
    const res = await fetch(`${API_BASE}/study/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ lessonId, quality })
    });
    if (!res.ok) throw new Error("Failed to submit review");
    return res.json();
  }
};