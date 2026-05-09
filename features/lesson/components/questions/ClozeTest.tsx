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

  // Also handle legacy "sentence" field that some old questions may have
  const legacySentence = (content as any)?.sentence;
  const textWithBlankField = (content as any)?.textWithBlank;

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
  } else if (!textBefore && textWithBlankField) {
    // Fallback for AI generated textWithBlank
    const sentenceText = toDisplayText(textWithBlankField, language);
    const blankIndex7 = sentenceText.indexOf("_______");
    const blankIndex5 = sentenceText.indexOf("_____");
    
    if (blankIndex7 >= 0) {
      textBefore = sentenceText.substring(0, blankIndex7);
      textAfter = sentenceText.substring(blankIndex7 + 7);
    } else if (blankIndex5 >= 0) {
      textBefore = sentenceText.substring(0, blankIndex5);
      textAfter = sentenceText.substring(blankIndex5 + 5);
    } else {
      textBefore = sentenceText;
      textAfter = "";
    }
  }

  // Also handle legacy "answer" field (single correct answer, no options)
  const legacyAnswer = (content as any)?.answer;
  let correctAnswer = toDisplayText(content.correctAnswer ?? legacyAnswer, language);

  // Fallback for AI generated correctIndex
  const correctIndex = (content as any)?.correctIndex;
  if (!correctAnswer && correctIndex !== undefined && content.options && content.options.length > correctIndex) {
    correctAnswer = toDisplayText(content.options[correctIndex], language);
  }

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
    onComplete(option === correctAnswer);
  };

  const nativeLanguage = language === "am" ? "ao" : "am"; // The learner's native language is the opposite of the target language
  const instructionLabel =
    nativeLanguage === "am" ? "ባዶ ቦታውን ይሙሉ" : "Bakka duwwaa guuti";

  const promptText = toDisplayText((content as any).prompt, language);

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
