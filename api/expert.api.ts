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
