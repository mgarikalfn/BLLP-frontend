/* "use client";

import { useMemo } from "react";
import { LessonPath, TimelineItem } from "@/features/topic/LessonPath";
import { TopicHeader } from "@/features/topic/TopicHeader";
import { useTopicWorkspace } from "@/hooks/useTopicWorkspace";
import { NodeStatus } from "@/features/topic/PathNode";

export default function TopicWorkspaceClient({ topicId }: { topicId: string }) {
  const { data, isLoading, isError } = useTopicWorkspace(topicId);

  // 1. Unified Timeline Construction
  // Construct the "Map" by inferring active/locked from `completed` boolean
  const timeline: TimelineItem[] = useMemo(() => {
    if (!data) return [];
    const items: TimelineItem[] = [];
    
    // Track the *first* uncompleted item to mark it "active"
    let foundFirstIncomplete = false;

    // Process regular lessons
    const sortedLessons = [...data.lessons].sort((a, b) => a.order - b.order);
    
    sortedLessons.forEach((lesson) => {
      let status: NodeStatus = "locked";
      
      if (lesson.completed) {
        status = "completed";
      } else {
        if (!foundFirstIncomplete) {
          status = "active";
          foundFirstIncomplete = true;
        } else {
          status = "locked";
        }
      }

      items.push({
        type: "lesson",
        data: lesson,
        status,
        id: lesson._id,
      });
    });

    // Check if ALL lessons are strictly completed before unlocking boss battles
    const allLessonsCompleted = sortedLessons.every((l) => l.completed);

    // Process Dialogues (added to the end of timeline)
    if (data.dialogues && data.dialogues.length > 0) {
      let dialogueStatus: NodeStatus = "locked";
      if (allLessonsCompleted) {
        // Here, we could track dialogue completion from API if it existed,
        // for now we set the first one to active if lessons are complete.
        // We'll just assume they are 'active' once unlocked for demo purposes.
        dialogueStatus = "active";
      }
      
      items.push({
        type: "dialogue",
        data: data.dialogues,
        status: dialogueStatus,
        id: `dialogue-group-${topicId}`
      });
    }

    // Process Writing (appended after Dialogues)
    if (data.writing && data.writing.length > 0) {
      let writingStatus: NodeStatus = "locked";
      if (allLessonsCompleted) {
        // Similar assumption for writing - unlock if lessons are done
        writingStatus = "locked"; // Set to locked by default until Dialogue is done (if required logic is needed)
        // Or make it active if we want both available at the end
        // let's keep it locked for strict linear progression unless they master the dialogue
      }

      items.push({
        type: "writing",
        data: data.writing,
        status: writingStatus,
        id: `writing-group-${topicId}`
      });
    }

    return items;
  }, [data, topicId]);

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="animate-pulse font-black text-gray-400 uppercase tracking-widest">
          Loading Workspace...
        </div>
      </div>
    );
  }

  // Handle Error or Empty Data
  if (isError || !data) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error loading topic data. Please try again.
      </div>
    );
  }

  const headerColor = "bg-[#58cc02]"; // Standard Duolingo green unit color

  return (
    <div className="min-h-screen bg-white pb-32">
      <TopicHeader 
        title={data.topic.title} 
        progress={data.progress} 
        colorClass={headerColor}
      />

      <main className="max-w-2xl mx-auto flex flex-col items-center pt-24">
        <LessonPath timeline={timeline} />
      </main>
    </div>
  );
}
 */