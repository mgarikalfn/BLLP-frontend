"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteTopicWorkspace } from "@/hooks/useTopicWorkspace";
import { TopicSection } from "@/features/topic/TopicSection";

export const LearnFeed = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteTopicWorkspace(5);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") return <div className="p-8 text-center text-gray-500">Loading learning path...</div>;
  if (status === "error") return <div className="p-8 text-center text-red-500">Failed to load learning path.</div>;

  const allTopics = data?.pages.flatMap((page) => page.topics) || [];

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-12 pb-24">
      {allTopics.map((topic) => (
        <TopicSection key={topic._id} topic={topic} />
      ))}
      <div ref={ref} className="h-20 w-full flex items-center justify-center">
        {isFetchingNextPage ? (
          <span className="text-gray-400">Loading more...</span>
        ) : hasNextPage ? (
          <span className="text-gray-400">Scroll for more</span>
        ) : (
          <span className="text-gray-400">You have reached the end!</span>
        )}
      </div>
    </div>
  );
};