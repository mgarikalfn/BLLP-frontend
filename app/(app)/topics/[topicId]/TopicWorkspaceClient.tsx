"use client";

import { useMemo } from "react";
import { useTopicWorkspace } from "@/hooks/useTopicWorkspace";
import { TopicSection } from "@/features/topic/TopicSection";

export default function TopicWorkspaceClient({ topicId }: { topicId: string }) {
  const { data, isLoading, isError } = useTopicWorkspace();

  const topic = useMemo(() => {
    return data?.topics.find((item) => item._id === topicId) ?? null;
  }, [data, topicId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="animate-pulse font-black text-gray-400 uppercase tracking-widest">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error loading topic data. Please try again.
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-10 text-center text-gray-600 font-semibold">
        Topic not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-start w-full relative pb-24">
      <div className="w-full max-w-3xl mx-auto">
        <TopicSection topic={topic} />
      </div>
    </div>
  );
}