import { useMemo, useState } from "react";
import { MatchingQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface MatchingGameProps {
  content: MatchingQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean, answerGiven?: any) => void;
  disabled?: boolean;
  testMode?: boolean;
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

export const MatchingGame = ({ content, language, onComplete, disabled = false, testMode = false }: MatchingGameProps) => {
  const prompt = toDisplayText(content.prompt, language);

  // Left column = Amharic words, Right column = Oromo words.
  // The AI generates pairs as { left: "Amharic", right: "Oromo" }.
  // Both learner directions see the same matching exercise — it's inherently bidirectional.
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
      const nextMatchedIds = new Set(matchedIds);
      nextMatchedIds.add(leftId);

      setMatchedIds(nextMatchedIds);

      setSelectedLeft(null);
      setSelectedRight(null);

      if (nextMatchedIds.size === (content.pairs?.length || 0)) {
        // Collect all matched texts
        const answerGiven = Array.from(nextMatchedIds).map((id) => {
          const leftItem = leftItems.find((i) => i.id === id);
          const rightItem = rightItems.find((i) => i.id === id);
          return { left: leftItem?.text, right: rightItem?.text };
        });
        onComplete(true, answerGiven);
      }
      return;
    }

    if (!testMode) {
      setWrongFlash({ left: leftIndex, right: rightIndex });
      onComplete(false);
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 350);
    } else {
      // In test mode, we might just let them link wrong ones? 
      // But matching inherently needs correct linking to clear them off the screen if we want them to finish.
      // Wait, if it's test mode, let's just let them match anything.
      // Actually, to make Matching work without feedback, we just record the match and visually link it.
      // But for simplicity, we can let them match incorrectly and just visually lock it, then check if all are matched.
      const nextMatchedIds = new Set(matchedIds);
      nextMatchedIds.add(leftId);
      nextMatchedIds.add(rightId); // Just add both to matched so they disappear/lock

      setMatchedIds(nextMatchedIds);

      setSelectedLeft(null);
      setSelectedRight(null);

      // We'll consider it complete when all left items are matched
      if (nextMatchedIds.size >= (content.pairs?.length || 0)) {
        onComplete(false, "Mismatched pairs completed"); // the backend will score it 0 or evaluate it properly if we pass the exact pairs
      }
    }
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

  // Column labels based on user language
  const leftLabel = language === "am" ? "አማርኛ" : "Amaariffaa";
  const rightLabel = language === "am" ? "ኦሮምኛ" : "Afaan Oromoo";

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      {prompt ? <h2 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">{prompt}</h2> : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Left column — Amharic words */}
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1 pl-1">{leftLabel}</p>
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
                  isMatched && !testMode && "border-green-300 bg-green-50 text-green-700 opacity-80",
                  isMatched && testMode && "border-slate-300 bg-slate-100 text-slate-500 opacity-80",
                  isWrong && "border-red-400 bg-red-50 text-red-600",
                  (disabled || isMatched) && "cursor-not-allowed"
                )}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Right column — Oromo words */}
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1 pl-1">{rightLabel}</p>
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
                  isMatched && !testMode && "border-green-300 bg-green-50 text-green-700 opacity-80",
                  isMatched && testMode && "border-slate-300 bg-slate-100 text-slate-500 opacity-80",
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
