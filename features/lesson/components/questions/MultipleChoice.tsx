import { useState } from "react";
import { MultipleChoiceQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface MultipleChoiceProps {
  content: MultipleChoiceQuestionContent;
  nativeLanguage: "am" | "ao";
  targetLanguage: "am" | "ao";
  onComplete: (isCorrect: boolean, answerGiven?: any) => void;
  disabled?: boolean;
  testMode?: boolean;
}

export const MultipleChoice = ({
  content,
  nativeLanguage,
  targetLanguage,
  onComplete,
  disabled = false,
  testMode = false,
}: MultipleChoiceProps) => {
  const instructionLabel =
    nativeLanguage === "am" ? "ትክክለኛውን ትርጉም ይምረጡ" : "Hiikkaa sirrii filadhu";

  // Show the word/phrase in the TARGET language (what the learner is studying)
  // so they must recognise it and pick its meaning in their NATIVE language.
  const prompt = toDisplayText(content.question ?? content.prompt, targetLanguage);
  const correctIndex = content.correctIndex ?? content.correctAnswerIndex ?? -1;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIsCorrect, setSelectedIsCorrect] = useState<boolean | null>(null);

  return (
    <div className="flex w-full animate-in slide-in-from-bottom-4 flex-col items-center justify-center duration-300">
      <p className="mb-2 self-start pl-1 text-xs font-black uppercase tracking-wider text-slate-500">{instructionLabel}</p>
      <h2 className="mb-8 self-start pl-1 text-2xl font-bold text-gray-800 sm:text-3xl">{prompt}</h2>

      <div className="grid w-full grid-cols-1 gap-4">
        {(content.options ?? []).map((option, index) => {
          // Show options in NATIVE language (what the learner understands)
          const optionText = toDisplayText(option, nativeLanguage);

          return (
            <button
              key={`${optionText}-${index}`}
              type="button"
              onClick={() => {
                const isCorrect = index === correctIndex;
                setSelectedIndex(index);
                if (!testMode) {
                  setSelectedIsCorrect(isCorrect);
                }
                // Send the actual text they clicked as answerGiven
                onComplete(isCorrect, option);
              }}
              disabled={disabled}
              className={cn(
                "w-full rounded-2xl border-2 border-b-4 bg-white p-4 text-left text-gray-700 transition-transform duration-150",
                "hover:bg-gray-50 active:scale-[0.99] active:border-b-2",
                selectedIndex === index && !testMode && selectedIsCorrect && "border-green-400 bg-green-50 text-green-700",
                selectedIndex === index && !testMode && selectedIsCorrect === false && "border-red-400 bg-red-50 text-red-700",
                selectedIndex === index && testMode && "border-blue-400 bg-blue-50 text-blue-700",
                disabled && "pointer-events-none opacity-70"
              )}
            >
              <span className="text-xl font-semibold">{optionText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
