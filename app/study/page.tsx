"use client";

import { useEffect } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { Header } from "@/components/study/header";
// import { LessonCard } from "@/components/study/lesson-card"; // Building this next!

export default function StudyPage() {
  const { status, initSession, resetSession } = useStudyStore();

  useEffect(() => {
    initSession();

    // Clean up store when user leaves the page
    return () => resetSession();
  }, [initSession, resetSession]);

  if (status === "loading") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-bold">Loading Session...</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <p className="text-rose-500 font-bold mb-4">Failed to load session.</p>
        <button onClick={() => initSession()} className="text-sky-500 underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-[600px] w-full px-6 h-full flex flex-col justify-center gap-y-12">
          {/* We'll drop the LessonCard here next */}
          <div className="h-[350px] w-full bg-white border-2 border-b-8 border-slate-200 rounded-3xl flex items-center justify-center text-slate-400">
             Lesson Content Placeholder
          </div>
        </div>
      </main>
    </div>
  );
}