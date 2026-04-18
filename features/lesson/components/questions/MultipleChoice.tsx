import { useState } from "react";
import { MultipleChoiceQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface MultipleChoiceProps {
  content: MultipleChoiceQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const MultipleChoice = ({ content, language, onComplete, disabled = false }: MultipleChoiceProps) => {
  const prompt = toDisplayText(content.question ?? content.prompt, language);
  const correctIndex = content.correctIndex ?? content.correctAnswerIndex ?? -1;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIsCorrect, setSelectedIsCorrect] = useState<boolean | null>(null);

  return (
    <div className="flex w-full animate-in slide-in-from-bottom-4 flex-col items-center justify-center duration-300">
      <h2 className="mb-8 self-start pl-1 text-2xl font-bold text-gray-800 sm:text-3xl">{prompt}</h2>

      <div className="grid w-full grid-cols-1 gap-4">
        {(content.options ?? []).map((option, index) => {
          const optionText = toDisplayText(option, language);

          return (
            <button
              key={`${optionText}-${index}`}
              type="button"
              onClick={() => {
                const isCorrect = index === correctIndex;
                setSelectedIndex(index);
                setSelectedIsCorrect(isCorrect);
                onComplete(isCorrect);
              }}
              disabled={disabled}
              className={cn(
                "w-full rounded-2xl border-2 border-b-4 bg-white p-4 text-left text-gray-700 transition-transform duration-150",
                "hover:bg-gray-50 active:scale-[0.99] active:border-b-2",
                selectedIndex === index && selectedIsCorrect && "border-green-400 bg-green-50 text-green-700",
                selectedIndex === index && selectedIsCorrect === false && "border-red-400 bg-red-50 text-red-700",
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
