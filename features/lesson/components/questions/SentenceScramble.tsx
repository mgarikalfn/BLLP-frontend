import { useMemo, useState } from "react";
import { ScrambleQuestionContent } from "@/types/learning";
import { cn } from "@/lib/utils";
import { toDisplayText } from "../QuestionHost";

interface SentenceScrambleProps {
  content: ScrambleQuestionContent;
  language: "am" | "ao";
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const resolveSentenceValue = (value: unknown, language: "am" | "ao"): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const localized = value as { am?: unknown; ao?: unknown };
    const preferred = localized[language];

    if (typeof preferred === "string") {
      return preferred;
    }

    if (typeof localized.am === "string") {
      return localized.am;
    }

    if (typeof localized.ao === "string") {
      return localized.ao;
    }
  }

  return "";
};

/**
 * Resolve a scrambled word list that may be:
 * - string[]  (legacy: ["word1", "word2"])
 * - { am: string[], ao: string[] }  (new bidirectional format)
 */
const resolveScrambledWords = (
  scrambled: unknown,
  shuffledWords: unknown,
  fallbackSentence: string,
  language: "am" | "ao",
): string[] => {
  // Try new bilingual format first: { am: [...], ao: [...] }
  if (scrambled && typeof scrambled === "object" && !Array.isArray(scrambled)) {
    const localized = scrambled as { am?: string[]; ao?: string[] };
    const preferred = localized[language];
    if (Array.isArray(preferred) && preferred.length > 0) return [...preferred];
    const fallbackLang = language === "am" ? "ao" : "am";
    const fallback = localized[fallbackLang];
    if (Array.isArray(fallback) && fallback.length > 0) return [...fallback];
  }

  // Legacy format: plain string[]
  if (Array.isArray(scrambled) && scrambled.length > 0) {
    return [...scrambled];
  }

  // Try shuffledWords
  if (Array.isArray(shuffledWords) && shuffledWords.length > 0) {
    return [...shuffledWords];
  }

  // Last resort: split the correct sentence
  return fallbackSentence ? fallbackSentence.split(/\s+/).filter(Boolean) : [];
};

const normalizeSentenceForCompare = (value: string): string => {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}''\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const SentenceScramble = ({ content, language, onComplete, disabled = false }: SentenceScrambleProps) => {
  const prompt = toDisplayText(content.prompt, language);
  const correctSentence = useMemo(() => {
    const preferred = resolveSentenceValue(content.correctSentence, language);
    const fallback = resolveSentenceValue(content.answer, language);

    return (preferred || fallback).trim();
  }, [content.correctSentence, content.answer, language]);

  const initialWordBank = useMemo(
    () => resolveScrambledWords(content.scrambled, content.shuffledWords, correctSentence, language),
    [content.shuffledWords, content.scrambled, correctSentence, language]
  );

  const [answerWords, setAnswerWords] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>(initialWordBank);

  const moveToAnswer = (word: string, index: number) => {
    if (disabled) return;
    setAnswerWords((prev) => [...prev, word]);
    setWordBank((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveToBank = (word: string, index: number) => {
    if (disabled) return;
    setWordBank((prev) => [...prev, word]);
    setAnswerWords((prev) => prev.filter((_, idx) => idx !== index));
  };

  const checkAnswer = () => {
    const composed = normalizeSentenceForCompare(answerWords.join(" "));
    const expected = normalizeSentenceForCompare(correctSentence);
    onComplete(composed === expected);
  };

  const expectedSlots = Math.max(initialWordBank.length, 1);

  // Localized labels
  const answerBoxLabel = language === "am" ? "መልስ" : "Deebii";
  const wordBankLabel = language === "am" ? "ቃላት" : "Jechootaa";
  const checkLabel = language === "am" ? "መልስ ያረጋግጡ" : "Deebii mirkaneessi";

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      {prompt ? <h2 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">{prompt}</h2> : null}

      <div className="mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{answerBoxLabel}</p>
        <div className="flex min-h-16 flex-wrap gap-2">
          {answerWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              onClick={() => moveToBank(word, index)}
              disabled={disabled}
              className="rounded-full border-2 border-b-4 border-blue-300 bg-blue-50 px-4 py-2 font-semibold text-blue-700 transition-transform hover:bg-blue-100 active:scale-95"
            >
              {word}
            </button>
          ))}
          {Array.from({ length: Math.max(expectedSlots - answerWords.length, 0) }).map((_, idx) => (
            <span
              key={`slot-${idx}`}
              className="inline-flex min-w-20 rounded-full border-2 border-dashed border-gray-300 px-4 py-2 text-transparent"
            >
              _
            </span>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{wordBankLabel}</p>
        <div className="flex flex-wrap gap-2">
          {wordBank.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              onClick={() => moveToAnswer(word, index)}
              disabled={disabled}
              className={cn(
                "rounded-full border-2 border-b-4 border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-transform",
                "hover:bg-gray-50 active:scale-95",
                disabled && "opacity-60"
              )}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={checkAnswer}
        disabled={disabled || answerWords.length === 0}
        className={cn(
          "w-full rounded-2xl border-b-4 px-4 py-3 text-lg font-bold text-white transition-transform active:scale-[0.99]",
          disabled || answerWords.length === 0
            ? "cursor-not-allowed border-gray-300 bg-gray-300"
            : "border-green-700 bg-green-600 hover:bg-green-700"
        )}
      >
        {checkLabel}
      </button>
    </div>
  );
};
