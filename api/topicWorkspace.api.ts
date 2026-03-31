import { api } from "@/lib/api";
import { TopicWorkspaceResponse, ApiResponse } from "@/types/learning";

export const getTopicWorkspace = async (topicId: string): Promise<TopicWorkspaceResponse> => {
  const res = await api.get<ApiResponse<TopicWorkspaceResponse>>(`/topics/${topicId}/workspace`);
  
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch topic workspace data");
  }
  
  return res.data.data;
};