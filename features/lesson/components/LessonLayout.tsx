"use client";

import { Heart, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { useEconomyStore } from "@/store/useEconomyStore";

interface LessonLayoutProps {
  currentIndex: number;
  totalSlides: number;
  children: ReactNode;
  footer: ReactNode;
  topicId?: string;
}

export const LessonLayout = ({ currentIndex, totalSlides, children, footer }: LessonLayoutProps) => {
  const progressPercentage = totalSlides === 0 ? 0 : (currentIndex / totalSlides) * 100;
  const hearts = useEconomyStore((state) => state.hearts);
  const fetchEconomyStatus = useEconomyStore((state) => state.fetchEconomyStatus);

  useEffect(() => {
    void fetchEconomyStatus();
  }, [fetchEconomyStatus]);

  // Fallback to /learn if no topicId is provided
  const exitLink =   "/topics";

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white relative overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center px-4 py-4 w-full max-w-5xl mx-auto gap-4 shrink-0">
        <Link 
          href={exitLink} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Exit lesson"
        >
          <X size={28} strokeWidth={2.5} />
        </Link>
        <Progress 
          value={progressPercentage} 
          className="h-4 flex-1 bg-[#E5E5E5] [&>div]:bg-green-500" 
        />
        <div
          className={`inline-flex min-w-[70px] items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-sm font-black ${
            hearts > 0
              ? "border-rose-200 bg-white text-rose-700"
              : "border-rose-100 bg-rose-50 text-rose-300"
          }`}
        >
          <Heart size={16} className={hearts > 0 ? "text-rose-500" : "text-rose-300"} />
          <span>{hearts}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-screen-sm mx-auto px-4 pb-32 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-50">
        {footer}
      </div>
    </div>
  );
};
