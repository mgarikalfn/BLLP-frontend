import { api } from "@/lib/api";

// Dashboard stats
export const getExpertStats = () => api.get("/expert/dashboard/stats");

// Pending content (review queue)
export const getPendingContent = (params?: { type?: string; topicId?: string }) =>
  api.get("/expert/content/pending", { params });

// All content with filters
export const getAllExpertContent = (params?: { type?: string; topicId?: string; status?: string }) =>
  api.get("/expert/content/all", { params });

// Verify (publish) content
export const verifyContent = (type: string, id: string) => api.patch(`/expert/content/${type}/${id}/verify`);

// Reject content (send back to draft)
export const rejectContent = (type: string, id: string) => api.patch(`/expert/content/${type}/${id}/reject`);

// Generate AI content
export const generateContent = (data: { type: string; topicId: string; level: string }) =>
  api.post("/expert/generate", data);

// Fetch all topics (reuse existing endpoint)
export const getTopics = () => api.get("/topics");

// Update lesson content (replaces lesson + quiz)
export const updateLesson = (
  lessonId: string,
  payload: {
    title: { am: string; ao: string };
    grammarNotes?: { am: string; ao: string };
    vocabulary?: Array<Record<string, unknown>>;
    dialogue?: Array<Record<string, unknown>>;
    quiz?: Array<Record<string, unknown>>;
  }
) => api.put(`/lessons/${lessonId}`, payload);

// Fetch lesson with populated quiz
export const getLessonById = (lessonId: string) => api.get(`/lessons/${lessonId}`);

// Generate questions for a topic
export const generateQuestions = (topicId: string) =>
  api.post("/expert/generate", { type: "QUESTION", topicId });

// Update expert content by type
export const updateExpertContent = (
  type: string,
  id: string,
  payload: Record<string, unknown>
) => api.put(`/expert/content/${type}/${id}`, payload);
