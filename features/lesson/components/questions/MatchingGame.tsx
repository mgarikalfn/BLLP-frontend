import { useMemo, useState } from "react";
import { MatchingQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface MatchingGameProps {
  content: MatchingQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

type SideItem = {
  id: number;
  text: string;
};

const shuffle = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const MatchingGame = ({ content, language, onComplete, disabled = false }: MatchingGameProps) => {
  const prompt = toDisplayText(content.prompt, language);

  const leftItems = useMemo<SideItem[]>(
    () => shuffle((content.pairs ?? []).map((pair, idx) => ({ id: idx, text: pair.left }))),
    [content.pairs]
  );

  const rightItems = useMemo<SideItem[]>(
    () => shuffle((content.pairs ?? []).map((pair, idx) => ({ id: idx, text: pair.right }))),
    [content.pairs]
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ left: number; right: number } | null>(null);

  const evaluatePair = (leftIndex: number, rightIndex: number) => {
    const leftId = leftItems[leftIndex]?.id;
    const rightId = rightItems[rightIndex]?.id;

    if (leftId === undefined || rightId === undefined) return;

    if (leftId === rightId) {
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(leftId);
        if (next.size === content.pairs.length) {
          onComplete(true);
        }
        return next;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
      return;
    }

    setWrongFlash({ left: leftIndex, right: rightIndex });
    onComplete(false);
    setTimeout(() => {
      setWrongFlash(null);
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 350);
  };

  const handleSelectLeft = (index: number) => {
    if (disabled) return;

    if (selectedRight !== null) {
      setSelectedLeft(index);
      evaluatePair(index, selectedRight);
      return;
    }

    setSelectedLeft(index);
  };

  const handleSelectRight = (index: number) => {
    if (disabled) return;

    if (selectedLeft !== null) {
      setSelectedRight(index);
      evaluatePair(selectedLeft, index);
      return;
    }

    setSelectedRight(index);
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      {prompt ? <h2 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">{prompt}</h2> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        <div className="space-y-3">
          {leftItems.map((item, index) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedLeft === index;
            const isWrong = wrongFlash?.left === index;

            return (
              <button
                key={`left-${item.id}-${index}`}
                type="button"
                onClick={() => handleSelectLeft(index)}
                disabled={disabled || isMatched}
                className={cn(
                  "w-full rounded-xl border-2 border-b-4 bg-white px-4 py-3 text-left font-semibold transition-transform duration-150",
                  "hover:bg-gray-50 active:scale-[0.99] active:border-b-2",
                  isSelected && "border-blue-400 bg-blue-50 text-blue-600",
                  isMatched && "border-green-300 bg-green-50 text-green-700 opacity-80",
                  isWrong && "border-red-400 bg-red-50 text-red-600",
                  (disabled || isMatched) && "cursor-not-allowed"
                )}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {rightItems.map((item, index) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedRight === index;
            const isWrong = wrongFlash?.right === index;

            return (
              <button
                key={`right-${item.id}-${index}`}
                type="button"
                onClick={() => handleSelectRight(index)}
                disabled={disabled || isMatched}
                className={cn(
                  "w-full rounded-xl border-2 border-b-4 bg-white px-4 py-3 text-left font-semibold transition-transform duration-150",
                  "hover:bg-gray-50 active:scale-[0.99] active:border-b-2",
                  isSelected && "border-blue-400 bg-blue-50 text-blue-600",
                  isMatched && "border-green-300 bg-green-50 text-green-700 opacity-80",
                  isWrong && "border-red-400 bg-red-50 text-red-600",
                  (disabled || isMatched) && "cursor-not-allowed"
                )}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
