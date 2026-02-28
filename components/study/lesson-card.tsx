"use client";

import { useStudyStore } from "@/store/use-study-store";
import { motion } from "framer-motion";

export const LessonCard = () => {
  const { lessons, currentIndex, isFlipped, flipCard } = useStudyStore();
  const currentLesson = lessons[currentIndex];

  if (!currentLesson) return null;

  // Assuming we show the first quiz question for the session
  const activeQuiz = currentLesson.quiz[0];

  return (
    <div className="perspective-1000 w-full h-[400px] cursor-pointer" onClick={flipCard}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full transition-all duration-500 preserve-3d"
      >
        {/* FRONT: The Question */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-b-8 border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
          <span className="text-slate-400 font-bold uppercase tracking-widest mb-4">Translate</span>
          
          {/* Showing the Amharic Question */}
          <h2 className="text-3xl font-bold text-slate-700 mb-2">
            {activeQuiz?.question.am}
          </h2>
          {/* Showing the Afaan Oromo Question */}
          <h3 className="text-xl text-slate-500">
            {activeQuiz?.question.ao}
          </h3>
          
          <p className="mt-8 text-sky-500 animate-pulse text-sm font-bold">Click to see options</p>
        </div>

        {/* BACK: The Options / Answer */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-b-8 border-sky-500 rounded-3xl flex flex-col items-center justify-center p-6"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="text-sky-500 font-bold uppercase tracking-widest mb-4">Select the correct answer</span>
          
          <div className="w-full flex flex-col gap-y-3">
            {activeQuiz?.options.map((option, idx) => (
              <div key={idx} className="w-full p-4 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition text-center text-slate-700 font-bold">
                {option.am} / {option.ao}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};