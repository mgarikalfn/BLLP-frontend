import { LocalizedString } from "@/types/learning";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TopicHeaderProps {
  title: LocalizedString;
  progress: {
    completedLessons: number;
    totalLessons: number;
  };
}

export const TopicHeader = ({ title, progress }: TopicHeaderProps) => {
  // Calculate percentage for the progress bar
  const percentage = Math.round((progress.completedLessons / progress.totalLessons) * 100) || 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 px-4 py-4">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        {/* Back Button */}
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6 stroke-3" />
        </Link>

        {/* Title and Progress */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <h1 className="font-black text-lg text-gray-700 leading-tight">
              {title.am} <span className="text-gray-400 mx-1">|</span> {title.ao}
            </h1>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {progress.completedLessons}/{progress.totalLessons} Lessons
            </span>
          </div>

          {/* The Progress Bar */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};