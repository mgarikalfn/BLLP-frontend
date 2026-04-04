import { api } from "@/lib/api";
import { TopicWorkspaceResponse, ApiResponse } from "@/types/learning";

export const getTopicWorkspace = async (page: number = 1, limit: number = 10): Promise<TopicWorkspaceResponse> => {
  const res = await api.get<ApiResponse<TopicWorkspaceResponse> | TopicWorkspaceResponse>(`/workspace`, {
    params: { page, limit }
  });

  if (!("success" in res.data)) {
    return res.data;
  }
  
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch workspace data");
  }
  
  return res.data.data;
};