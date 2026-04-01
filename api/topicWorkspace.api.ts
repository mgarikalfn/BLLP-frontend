import { api } from "@/lib/api";
import { TopicWorkspaceResponse, ApiResponse } from "@/types/learning";

export const getTopicWorkspace = async (page: number = 1, limit: number = 10): Promise<TopicWorkspaceResponse> => {
  const res = await api.get<ApiResponse<TopicWorkspaceResponse>>(`/workspace`, {
    params: { page, limit }
  });
  
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch workspace data");
  }
  
  return res.data.data;
};