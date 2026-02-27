"use client";

import { X, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useStudyStore } from "@/store/use-study-store";
import { motion } from "framer-motion";

export const Header = () => {
  const { currentIndex, lessons, stats } = useStudyStore();
  
  // Calculate percentage based on current index
  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    return (currentIndex / lessons.length) * 100;
  };

  return (
    <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
      {/* Exit Button - Reset session on click */}
      <button 
        onClick={() => window.location.href = "/learn"} // Or use next/navigation
        className="text-slate-500 hover:opacity-75 transition cursor-pointer"
      >
        <X className="h-6 w-6 stroke-[3]" />
      </button>

      {/* Progress Bar with Motion wrapper */}
      <div className="flex-1 relative">
        <Progress value={calculateProgress()} className="h-4 w-full" />
        
        {/* Subtle shine effect for that 'SaaS' polish */}
        <div className="absolute top-1 left-1 w-full h-1 bg-white/20 rounded-full pointer-events-none" />
      </div>

      {/* Streak Counter with a 'Pop' animation when streak changes */}
      <div className="flex items-center gap-x-2">
        <motion.div
          key={stats?.currentStreak}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="text-rose-500 flex items-center font-bold"
        >
          <Flame className="h-6 w-6 fill-current" />
          <span className="ml-2 text-xl">{stats?.currentStreak ?? 0}</span>
        </motion.div>
      </div>
    </header>
  );
};