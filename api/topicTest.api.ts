import axios from "axios";
import { api } from "@/lib/api";
import { ApiResponse, TopicTestResponse } from "@/types/learning";

type TopicTestPayload = ApiResponse<TopicTestResponse> | TopicTestResponse;

const normalizeTopicTestPayload = (payload: TopicTestPayload): TopicTestResponse => {
  if ("success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Failed to fetch topic test");
    }

    return payload.data;
  }

  return payload;
};

export const getTopicTest = async (topicId: string, size?: number): Promise<TopicTestResponse> => {
  const endpoints = [`/topics/${topicId}/test`, `/api/topics/${topicId}/test`];

  for (const endpoint of endpoints) {
    try {
      const res = await api.get<TopicTestPayload>(endpoint, {
        params: size ? { size } : undefined,
      });

      return normalizeTopicTestPayload(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to fetch topic test");
};

export const submitTopicTestResult = async (topicId: string, passed: boolean, score: number): Promise<{ success: boolean; message?: string }> => {
  const res = await api.post(`/topics/${topicId}/test/submit`, { passed, score });
  return res.data;
};
