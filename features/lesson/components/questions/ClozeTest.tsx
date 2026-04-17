import { useMemo, useState } from "react";
import { ClozeQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface ClozeTestProps {
  content: ClozeQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ClozeTest = ({ content, language, onComplete, disabled = false }: ClozeTestProps) => {
  const [selectedWord, setSelectedWord] = useState<string>("");

  const textBefore = toDisplayText(content.textBeforeBlank, language);
  const textAfter = toDisplayText(content.textAfterBlank, language);
  const correctAnswer = toDisplayText(content.correctAnswer, language);

  const options = useMemo(
    () => (content.options ?? []).map((option) => toDisplayText(option, language)),
    [content.options, language]
  );

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelectedWord(option);
    onComplete(option === correctAnswer);
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-xl font-semibold leading-relaxed text-gray-800 sm:text-2xl">
        <span>{textBefore} </span>
        <span className="inline-flex min-w-24 items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-1 text-blue-700">
          {selectedWord || "[   ]"}
        </span>
        <span> {textAfter}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {options.map((option, index) => {
          const isSelected = selectedWord === option;

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={cn(
                "rounded-full border-2 border-b-4 px-4 py-2 font-semibold transition-transform",
                "hover:bg-gray-50 active:scale-95",
                isSelected ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700",
                disabled && "opacity-70"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
