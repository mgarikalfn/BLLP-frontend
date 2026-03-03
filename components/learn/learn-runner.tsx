"use client";

import { useLearnStore } from "@/store/user-learn-store";
import { ProgressHeader } from "./progress-header";
import { PresentationView } from "./presentation-view";
import { QuizView } from "./quiz-view";
import { SummaryView } from "./summary-view";


export const LearnRunner = () => {
  const { mode, lessons, currentIndex, status } = useLearnStore();

  if (status === "loading") return <div>Loading Topic...</div>;
  if (!lessons.length) return <div>No lessons available.</div>;

  const currentLesson = lessons[currentIndex];

  return (
    <div className="max-w-[800px] mx-auto min-h-screen flex flex-col p-6">
      <ProgressHeader 
        current={currentIndex + 1} 
        total={lessons.length} 
      />

      <main className="flex-1 flex flex-col items-center justify-center py-12">
        {mode === "presentation" && (
          <PresentationView lesson={currentLesson} />
        )}

        {mode === "quiz" && (
          <QuizView quiz={currentLesson.quiz[0]} />
        )}

        {mode === "summary" && (
          <SummaryView />
        )}
      </main>
    </div>
  );
};