"use client";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getTopicWorkspace } from "@/api/topicWorkspace.api";

export const useTopicWorkspace = () => {
  return useQuery({
    queryKey: ["topicWorkspace"],
    queryFn: () => getTopicWorkspace(1, 10),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInfiniteTopicWorkspace = (limit: number = 5) => {
  return useInfiniteQuery({
    queryKey: ["topicWorkspace", "infinite"],
    queryFn: ({ pageParam = 1 }) => getTopicWorkspace(pageParam, limit),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    initialPageParam: 1,
  });
};