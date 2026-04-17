"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopicTest } from "@/api/topicTest.api";
import { TopicTestResponse } from "@/types/learning";

export const useTopicTest = (topicId: string, size?: number) => {
  return useQuery<TopicTestResponse, Error>({
    queryKey: ["topicTest", topicId, size],
    queryFn: () => getTopicTest(topicId, size),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
  });
};
