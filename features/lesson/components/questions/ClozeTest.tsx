import { useMemo, useState } from "react";
import { ClozeQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface ClozeTestProps {
  content: ClozeQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean, answerGiven?: any) => void;
  disabled?: boolean;
  testMode?: boolean;
}

export const ClozeTest = ({ content, language, onComplete, disabled = false, testMode = false }: ClozeTestProps) => {
  const [selectedWord, setSelectedWord] = useState<string>("");

  // Also handle legacy "sentence" field that some old questions may have
  const legacySentence = (content as any)?.sentence;
  let textBefore = toDisplayText(content.textBeforeBlank, language);
  let textAfter = toDisplayText(content.textAfterBlank, language);

  // Fallback: if textBeforeBlank is empty but we have a legacy "sentence" field
  if (!textBefore && legacySentence) {
    const sentenceText = toDisplayText(legacySentence, language);
    const blankIndex = sentenceText.indexOf("_____");
    if (blankIndex >= 0) {
      textBefore = sentenceText.substring(0, blankIndex);
      textAfter = sentenceText.substring(blankIndex + 5);
    } else {
      textBefore = sentenceText;
      textAfter = "";
    }
  }

  // Also handle legacy "answer" field (single correct answer, no options)
  const legacyAnswer = (content as any)?.answer;
  const correctAnswer = toDisplayText(content.correctAnswer ?? legacyAnswer, language);

  const options = useMemo(() => {
    if (content.options && content.options.length > 0) {
      return content.options.map((option) => toDisplayText(option, language));
    }
    // Legacy fallback: if no options array, just show the correct answer as the only option
    if (correctAnswer) {
      return [correctAnswer];
    }
    return [];
  }, [content.options, language, correctAnswer]);

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelectedWord(option);
    onComplete(option === correctAnswer, option);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !selectedWord.trim()) return;
    onComplete(selectedWord === correctAnswer, selectedWord);
  };

  const nativeLanguage = language === "am" ? "ao" : "am"; // The learner's native language is the opposite of the target language
  const instructionLabel =
    nativeLanguage === "am" ? "ባዶ ቦታውን ይሙሉ" : "Bakka duwwaa guuti";

  const promptText = toDisplayText((content as any).prompt, nativeLanguage);

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      <p className="mb-2 self-start pl-1 text-xs font-black uppercase tracking-wider text-slate-500">
        {promptText || instructionLabel}
      </p>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-xl font-semibold leading-relaxed text-gray-800 sm:text-2xl">
        <span>{textBefore} </span>
        <span className="inline-flex min-w-24 items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-1 text-blue-700">
          {selectedWord || "[   ]"}
        </span>
        <span> {textAfter}</span>
      </div>

      {options.length > 0 ? (
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
      ) : (
        <form onSubmit={handleInputSubmit} className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={selectedWord}
            onChange={(e) => setSelectedWord(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className="w-full sm:flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-800 focus:border-blue-500 focus:outline-none disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={disabled || !selectedWord.trim()}
            className="w-full sm:w-auto rounded-xl border-b-4 border-blue-700 bg-blue-600 px-6 py-3 font-bold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-300"
          >
            {testMode ? "Lock In" : "Check"}
          </button>
        </form>
      )}
    </div>
  );
};
