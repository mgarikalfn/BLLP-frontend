"use client";

import { BossBattleCard } from "@/features/topic/BossBattleCard";
import { LessonPath } from "@/features/topic/LessonPath";
import { TopicHeader } from "@/features/topic/TopicHeader";
import { useTopicWorkspace } from "@/hooks/useTopicWorkspace";


export default function TopicWorkspaceClient({ topicId }: { topicId: string }) {
  const { data, isLoading, isError } = useTopicWorkspace(topicId);

  // 1. Handle Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="animate-pulse font-black text-gray-400 uppercase tracking-widest">
          Loading Workspace...
        </div>
      </div>
    );
  }

  // 2. Handle Error or Empty Data (This is where your crash was happening)
  if (isError || !data) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error loading topic data. Please try again.
      </div>
    );
  }

  // 3. Now it is safe to access data!
  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-32">
      <TopicHeader 
        title={data.topic.title} 
        progress={data.userProgress} 
      />

      <main className="max-w-lg mx-auto mt-8 flex flex-col items-center gap-6">
        <LessonPath 
          lessons={data.lessons} 
          completedCount={data.userProgress.completedLessons} 
        />

        <div className="w-full px-4 mt-8 space-y-4">
          <BossBattleCard 
            type="DIALOGUE" 
            items={data.dialogues} 
            unlocked={data.userProgress.isTopicMastered} 
          />
          <BossBattleCard 
            type="WRITING" 
            items={data.writingExercises} 
            unlocked={data.userProgress.isTopicMastered} 
          />
        </div>
      </main>
    </div>
  );
}