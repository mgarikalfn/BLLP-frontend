"use client";

import { useState } from "react";
import { ChunkyButton } from "@/components/ui/chunky-button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useLearnStore } from "@/store/user-learn-store";

export const QuizView = ({ quiz }: { quiz: any }) => {
  const { nativeLang, learningLang, completeLesson } = useLearnStore();
  
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleCheck = async () => {
    if (selectedIdx === null) return;

    const correct = selectedIdx === quiz.correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      // Wait a moment so the user sees the "Correct" green state
      setTimeout(() => {
        completeLesson("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTAzZWNhYjUzMTNiNjEwODQ2ODNhNCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MjU1MzI3NywiZXhwIjoxNzcyNTU2ODc3fQ.IBmIS86D1AdJsppnR7skO7d-ouy4sGMPiJ89e2Ae2Sg");
        setSelectedIdx(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-y-8 animate-in fade-in zoom-in-95">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-700">
          {quiz.question[nativeLang]}
        </h2>
        <p className="text-slate-400 font-medium">Select the correct translation</p>
      </div>

      <div className="grid gap-y-3">
        {quiz.options.map((option: any, idx: number) => {
          const isSelected = selectedIdx === idx;
          const showSuccess = isCorrect && isSelected;
          const showError = isCorrect === false && isSelected;

          return (
            <button
              key={idx}
              disabled={isCorrect === true}
              onClick={() => setSelectedIdx(idx)}
              className={`
                w-full p-5 rounded-2xl border-2 border-b-4 text-left transition-all active:border-b-0
                ${isSelected ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:bg-slate-50"}
                ${showSuccess ? "border-green-500 bg-green-50 text-green-700" : ""}
                ${showError ? "border-rose-500 bg-rose-50 text-rose-700" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{option[learningLang]}</span>
                {showSuccess && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {showError && <XCircle className="w-6 h-6 text-rose-500" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <ChunkyButton 
          variant="primary"
          disabled={selectedIdx === null || (isCorrect === true)}
          onClick={handleCheck}
          className="w-full"
        >
          {isCorrect === null ? "Check Answer" : isCorrect ? "Correct!" : "Try Again"}
        </ChunkyButton>
      </div>
    </div>
  );
};