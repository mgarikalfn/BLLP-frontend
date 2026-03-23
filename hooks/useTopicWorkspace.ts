"use client";
import { useQuery } from "@tanstack/react-query";
import { getTopicWorkspace } from "@/api/topicWorkspace.api";

export const useTopicWorkspace = (topicId:string) => {
  return useQuery({
    queryKey: ["topicWorkspace",topicId],
    queryFn:()=> getTopicWorkspace(topicId),
    enabled:!!topicId,
    staleTime: 1000 * 60 * 5,
  });
};