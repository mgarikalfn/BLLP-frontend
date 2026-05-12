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

// Fetch lessons for a topic
export const getLessonsByTopic = (topicId: string) => api.get(`/lessons/topic/${topicId}`);

// Generate AI content
export const generateContent = (data: { type: string; topicId: string; level: string; lessonId?: string }) =>
  api.post("/expert/generate", data);

// Generate AI topic
export const generateTopic = (data: { theme: string; section: string; level: string }) =>
  api.post("/expert/generate", { type: "TOPIC", ...data });

// Fetch all topics (reuse existing endpoint)
export const getTopics = () => api.get("/topics");

// Fetch all topics
export const getAllTopics = () => api.get("/topics");

// Update topic
export const updateTopic = (
  id: string,
  payload: {
    title?: { am: string; ao: string };
    description?: { am: string; ao: string };
    tips?: { am: string; ao: string };
    level?: string;
    section?: string;
    unitNumber?: number;
    thumbnailUrl?: string;
    isPublished?: boolean;
  }
) => api.put(`/topics/${id}`, payload);

// Publish topic
export const publishTopic = (id: string) => api.patch(`/topics/${id}/publish`);

// Delete topic
export const deleteTopic = (id: string) => api.delete(`/topics/${id}`);

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

// Generate missing audio for a lesson
export const generateLessonAudio = (lessonId: string) => api.put(`/lessons/${lessonId}/generate-audio`);

// Regenerate specific audio clip
export const regenerateAudio = (lessonId: string, data: { vocabIndex: number; isExample: boolean; language: "am" | "ao" }) => 
  api.put(`/lessons/${lessonId}/regenerate-audio`, data);

// Generate questions for a topic
export const generateQuestions = (topicId: string) =>
  api.post("/expert/generate", { type: "QUESTION", topicId });

// Update expert content by type
export const updateExpertContent = (
  type: string,
  id: string,
  payload: Record<string, unknown> | Array<Record<string, unknown>>
) => api.put(`/expert/content/${type}/${id}`, payload);

// Fetch pending chat reports
export const getPendingReports = () => api.get("/reports/pending");

// Resolve a report
export const resolveReport = (reportId: string, data: { actionTaken: string; note?: string }) => 
  api.patch(`/reports/${reportId}/resolve`, data);

// Fetch conversation history for moderation
export const getModerationHistory = (conversationId: string) =>
  api.get(`/reports/conversations/${conversationId}/messages`);
