"use client";

import React, { useEffect } from "react";
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
      {allTopics.map((topic, index) => {
        const prevSection = index > 0 ? allTopics[index - 1].section : null;
        const currentSection = topic.section;
        const showSeparator = currentSection && currentSection !== prevSection;

        const sectionLabels: Record<string, { label: string; color: string }> = {
          INTRO: { label: "Introduction", color: "bg-purple-100 border-purple-200 text-purple-800" },
          A1: { label: "Section 1 · Beginner", color: "bg-sky-100 border-sky-200 text-sky-800" },
          A2: { label: "Section 2 · Elementary", color: "bg-blue-100 border-blue-200 text-blue-800" },
          B1: { label: "Section 3 · Intermediate", color: "bg-indigo-100 border-indigo-200 text-indigo-800" },
          B2: { label: "Section 4 · Upper Intermediate", color: "bg-violet-100 border-violet-200 text-violet-800" },
        };

        const sep = currentSection && sectionLabels[currentSection]
          ? sectionLabels[currentSection]
          : null;

        return (
          <React.Fragment key={topic._id}>
            {showSeparator && sep && (
              <div className={`w-full rounded-2xl border-2 px-5 py-4 ${sep.color}`}>
                <p className="text-sm font-black uppercase tracking-[0.2em]">{sep.label}</p>
              </div>
            )}
            <TopicSection topic={topic} />
          </React.Fragment>
        );
      })}
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