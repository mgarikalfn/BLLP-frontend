import { LocalizedString } from "@/types/learning";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TopicHeaderProps {
  title: LocalizedString;
  progress: {
    completedLessons: number;
    totalLessons: number;
  };
  colorClass?: string; // Optional duolingo styling banner color (e.g. bg-blue-500)
}

export const TopicHeader = ({ title, progress, colorClass = "bg-blue-500" }: TopicHeaderProps) => {
  return (
    <header className={cn("sticky top-0 z-50 text-white shadow-md transition-all", colorClass)}>
      {/* Top utility bar */}
      <div className="w-full flex items-center px-4 py-3 md:py-4 max-w-3xl mx-auto lg:px-8">
        <Link href="/dashboard" className="text-white hover:opacity-80 transition-opacity p-2 -ml-2 rounded-full">
          <ArrowLeft className="w-6 h-6 stroke-[3px]" />
        </Link>
        <div className="flex-1 flex justify-center items-center font-bold text-sm tracking-widest uppercase opacity-90">
          Unit 1 {/* Dynamic unit numbers could go here later */}
        </div>
        <div className="w-10" /> {/* Spacer to balance flex */}
      </div>

      {/* Main banner block */}
      <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-6 md:pb-8 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="font-black text-2xl lg:text-3xl leading-tight mb-2">
            {title.am} <span className="opacity-70 mx-1">|</span> {title.ao}
          </h1>
          <div className="text-sm font-bold opacity-90 bg-black/10 inline-block px-3 py-1 rounded-full">
            {progress.completedLessons}/{progress.totalLessons} Lessons
          </div>
        </div>
        
       
      </div>
    </header>
  );
};
