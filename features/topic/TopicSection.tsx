import React from "react";
import { WorkspaceTopic } from "@/types/learning";
import { LessonPathContainer } from "./LessonPathContainer";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn ui
import { Shield, BookOpen, Star } from "lucide-react"; // Sample icons

interface TopicSectionProps {
  topic: WorkspaceTopic;
}

export const TopicSection: React.FC<TopicSectionProps> = ({ topic }) => {
  // Determine gradient / color based on level
  let bgClass = "bg-slate-100 text-slate-800 border-slate-200";
  let icon = <BookOpen className="w-6 h-6" />;
  
  if (topic.level?.toUpperCase() === "BEGINNER") {
    bgClass = "bg-blue-100 text-blue-900 border-blue-200";
  } else if (topic.level?.toUpperCase() === "INTERMEDIATE") {
    bgClass = "bg-purple-100 text-purple-900 border-purple-200";
  } else if (topic.level?.toUpperCase() === "ADVANCED") {
    bgClass = "bg-rose-100 text-rose-900 border-rose-200";
    icon = <Shield className="w-6 h-6" />;
  }

  const { completedLessons, totalLessons, percentage } = topic.progress || { completedLessons: 0, totalLessons: 0, percentage: 0 };
  const amharicTitle = topic.title?.am || "Topic";

  return (
    <section className="w-full mb-16 relative">
      <div 
        className={`sticky top-0 z-50 p-4 border-b shadow-sm w-full rounded-b-xl flex justify-between items-center ${bgClass} backdrop-blur-md bg-opacity-95`}
      >
        <div className="flex items-center gap-3 w-1/2">
          {icon}
          <div>
            <h2 className="text-xl font-bold">{amharicTitle}</h2>
            <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">{topic.level}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end min-w-30">
          <span className="text-sm font-bold whitespace-nowrap">
            {completedLessons} / {totalLessons} Lessons
          </span>
          <Progress value={percentage} className="w-full h-2 rounded-full" />
        </div>
      </div>
      
      <div className="pt-10 px-4">
        <LessonPathContainer
          topicId={topic._id}
          lessons={topic.lessons || []}
          dialogues={topic.dialogues || []}
        />
      </div>
    </section>
  );
};