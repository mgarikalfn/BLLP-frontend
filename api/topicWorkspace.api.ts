import { api } from "@/lib/api";
import { TopicWorkspaceResponse } from "@/types/learning";


export const getTopicWorkspace = async (topicId:string): Promise<TopicWorkspaceResponse> => {
  const res = await api.get(`/topics/${topicId}/workspace`);
  return res.data.data;
};