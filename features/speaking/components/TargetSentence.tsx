import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface TargetSentenceProps {
  expectedText: string;
  transcribedText?: string;
  labels: {
    targetSentence: string;
    aiHeard: string;
  };
}

const normalizeWord = (word: string) => {
  return word
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}'’-]+/gu, "")
    .trim();
};

const getMatchedWordIndices = (expectedText: string, transcribedText?: string) => {
  const expectedWords = expectedText.split(/\s+/).filter(Boolean);
  const heardWords = (transcribedText || "")
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);

  const matchedIndices = new Set<number>();
  let heardPointer = 0;

  for (let index = 0; index < expectedWords.length; index += 1) {
    const expectedWord = normalizeWord(expectedWords[index]);
    if (!expectedWord) continue;

    while (heardPointer < heardWords.length && heardWords[heardPointer] !== expectedWord) {
      heardPointer += 1;
    }

    if (heardPointer < heardWords.length && heardWords[heardPointer] === expectedWord) {
      matchedIndices.add(index);
      heardPointer += 1;
    }
  }

  return {
    expectedWords,
    matchedIndices,
  };
};

export const TargetSentence = ({ expectedText, transcribedText, labels }: TargetSentenceProps) => {
  const { expectedWords, matchedIndices } = useMemo(
    () => getMatchedWordIndices(expectedText, transcribedText),
    [expectedText, transcribedText]
  );

  return (
    <section className="rounded-2xl border-2 border-sky-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-sky-600">{labels.targetSentence}</p>
      <p className="mt-3 text-2xl font-black leading-snug text-slate-900">
        {expectedWords.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={cn(
              matchedIndices.has(index) && "underline decoration-green-500 decoration-4"
            )}
          >
            {word}
            {index < expectedWords.length - 1 ? " " : ""}
          </span>
        ))}
      </p>

      {transcribedText ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{labels.aiHeard}</p>
          <p className="mt-1 text-base font-semibold text-slate-700">{transcribedText}</p>
        </div>
      ) : null}
    </section>
  );
};
