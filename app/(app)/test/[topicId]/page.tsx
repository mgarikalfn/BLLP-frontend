"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTopicTest } from "@/hooks/useTopicTest";
import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";
import { LocalizedOrString, MatchingQuestionContent, TopicTestClozeContent, TopicTestQuestion } from "@/types/learning";

type LearningLanguage = "am" | "ao";

const PASS_THRESHOLD = 80;

const getLocalizedText = (
  value: LocalizedOrString | undefined,
  targetLanguage: LearningLanguage,
  fallbackLanguage: LearningLanguage
) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[targetLanguage] || value[fallbackLanguage] || value.am || value.ao || "";
};

const normalizeCompareValue = (value: string) => {
  return value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}'’\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

interface MatchingQuestionProps {
  question: TopicTestQuestion;
  targetLanguage: LearningLanguage;
  fallbackLanguage: LearningLanguage;
  onAnswered: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const MatchingQuestion = ({
  question,
  targetLanguage,
  fallbackLanguage,
  onAnswered,
  disabled = false,
}: MatchingQuestionProps) => {
  const content = question.content as MatchingQuestionContent;
  const prompt = getLocalizedText(content.prompt, targetLanguage, fallbackLanguage);

  const sourcePairs = useMemo(
    () =>
      (content.pairs || []).map((pair, index) => ({
        id: `${question._id}-${index}`,
        left: pair.left,
        right: pair.right,
      })),
    [content.pairs, question._id]
  );

  const [leftSelectedId, setLeftSelectedId] = useState<string | null>(null);
  const [rightSelectedId, setRightSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  const shuffledLeft = useMemo(() => sourcePairs, [sourcePairs]);
  const shuffledRight = useMemo(() => [...sourcePairs].reverse(), [sourcePairs]);

  const checkMatch = (leftId: string, rightId: string) => {
    const isCorrectPair = leftId === rightId;

    if (isCorrectPair) {
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(leftId);

        if (next.size === sourcePairs.length) {
          onAnswered(mistakes === 0);
        }

        return next;
      });
    } else {
      setMistakes((prev) => prev + 1);
      setWrongPair({ left: leftId, right: rightId });
      window.setTimeout(() => setWrongPair(null), 300);
    }

    setLeftSelectedId(null);
    setRightSelectedId(null);
  };

  const onSelectLeft = (pairId: string) => {
    if (disabled || matchedIds.has(pairId)) return;

    if (rightSelectedId) {
      checkMatch(pairId, rightSelectedId);
      return;
    }

    setLeftSelectedId(pairId);
  };

  const onSelectRight = (pairId: string) => {
    if (disabled || matchedIds.has(pairId)) return;

    if (leftSelectedId) {
      checkMatch(leftSelectedId, pairId);
      return;
    }

    setRightSelectedId(pairId);
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      {prompt ? <h2 className="mb-6 text-2xl font-black text-slate-800">{prompt}</h2> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        <div className="space-y-3">
          {shuffledLeft.map((pair) => (
            <button
              key={`left-${pair.id}`}
              type="button"
              disabled={disabled || matchedIds.has(pair.id)}
              onClick={() => onSelectLeft(pair.id)}
              className={cn(
                "w-full rounded-xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition-all",
                "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                leftSelectedId === pair.id && "border-indigo-400 bg-indigo-50 text-indigo-700",
                wrongPair?.left === pair.id && "border-rose-400 bg-rose-50 text-rose-700",
                matchedIds.has(pair.id) && "border-emerald-300 bg-emerald-50 text-emerald-700",
                (disabled || matchedIds.has(pair.id)) && "cursor-not-allowed opacity-80"
              )}
            >
              {pair.left}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {shuffledRight.map((pair) => (
            <button
              key={`right-${pair.id}`}
              type="button"
              disabled={disabled || matchedIds.has(pair.id)}
              onClick={() => onSelectRight(pair.id)}
              className={cn(
                "w-full rounded-xl border-2 border-b-4 px-4 py-3 text-left font-semibold transition-all",
                "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                rightSelectedId === pair.id && "border-indigo-400 bg-indigo-50 text-indigo-700",
                wrongPair?.right === pair.id && "border-rose-400 bg-rose-50 text-rose-700",
                matchedIds.has(pair.id) && "border-emerald-300 bg-emerald-50 text-emerald-700",
                (disabled || matchedIds.has(pair.id)) && "cursor-not-allowed opacity-80"
              )}
            >
              {pair.right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ClozeQuestionProps {
  question: TopicTestQuestion;
  targetLanguage: LearningLanguage;
  fallbackLanguage: LearningLanguage;
  onAnswered: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const ClozeQuestion = ({
  question,
  targetLanguage,
  fallbackLanguage,
  onAnswered,
  disabled = false,
}: ClozeQuestionProps) => {
  const content = question.content as TopicTestClozeContent;
  const sentence = getLocalizedText(content.sentence, targetLanguage, fallbackLanguage);
  const translation = getLocalizedText(content.sentence, fallbackLanguage, targetLanguage);
  const answer = getLocalizedText(content.answer, targetLanguage, fallbackLanguage);

  const [input, setInput] = useState("");

  const check = () => {
    if (disabled || !input.trim()) return;
    onAnswered(normalizeCompareValue(input) === normalizeCompareValue(answer));
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border-2 border-violet-100 bg-violet-50/60 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-violet-600">Fill The Blank</p>
        <p className="mt-2 text-xl font-black leading-relaxed text-slate-800">{sentence}</p>
        {translation && translation !== sentence ? (
          <p className="mt-1 text-sm font-medium text-slate-500">{translation}</p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={disabled}
          placeholder={targetLanguage === "am" ? "Type your answer" : "Deebii kee barreessi"}
          className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg font-semibold text-slate-800 outline-none focus:border-violet-400 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={check}
          disabled={disabled || input.trim().length === 0}
          className={cn(
            "h-12 min-w-36 rounded-xl border-b-4 px-5 font-black text-white transition-all",
            disabled || input.trim().length === 0
              ? "cursor-not-allowed border-slate-300 bg-slate-300"
              : "border-violet-700 bg-violet-600 hover:bg-violet-700"
          )}
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default function TopicTestPage() {
  const params = useParams<{ topicId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();    const markCompleted = useProgressStore((state) => state.markCompleted);
  const lang = useLanguageStore((state) => state.lang);
  const targetLanguage: LearningLanguage = lang === "ao" ? "ao" : "am";
  const helperLanguage: LearningLanguage = targetLanguage === "am" ? "ao" : "am";

  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;

  const { data, isLoading, error } = useTopicTest(topicId || "");

  const questions = useMemo(() => data?.questions || [], [data?.questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [currentAnswered, setCurrentAnswered] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!questions.length) return;
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(false));
    setCurrentAnswered(null);
    setFinished(false);
  }, [questions]);

  const currentQuestion = questions[currentIndex];

  const onAnswered = (isCorrect: boolean) => {
    if (currentAnswered !== null) return;

    setCurrentAnswered(isCorrect);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = isCorrect;
      return next;
    });
  };

  const continueNext = () => {
    if (currentAnswered === null) return;

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setCurrentAnswered(null);
  };

  const correctCount = answers.filter(Boolean).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = score >= PASS_THRESHOLD;

  useEffect(() => {
    if (!finished || !passed) return;

    let mounted = true;

    const runConfetti = async () => {
      const { default: confetti } = await import("canvas-confetti");

      if (!mounted) return;

      confetti({
        particleCount: 160,
        spread: 120,
        startVelocity: 50,
        origin: { y: 0.65 },
      });
    };

    runConfetti();

    return () => {
      mounted = false;
    };
  }, [finished, passed]);

  const completeAndGoTopics = async () => {
    if (passed && topicId) {
      markCompleted(topicId + "_test");
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] }),
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace", "infinite"] }),
    ]);

    router.push("/topics");
  };

  if (!topicId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 text-center">
        <p className="text-lg font-semibold text-rose-500">Invalid topic id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-violet-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h2 className="text-xl font-black text-slate-700">Failed to load topic test</h2>
        <p className="text-sm font-medium text-slate-500">{error.message}</p>
        <button
          type="button"
          onClick={() => router.push(`/topics/${topicId}`)}
          className="rounded-xl border-b-4 border-slate-600 bg-slate-500 px-6 py-3 font-black text-white"
        >
          Back To Topic
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h2 className="text-xl font-black text-slate-700">No test questions available yet.</h2>
        <button
          type="button"
          onClick={() => router.push(`/topics/${topicId}`)}
          className="rounded-xl border-b-4 border-slate-600 bg-slate-500 px-6 py-3 font-black text-white"
        >
          Back To Topic
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border-2 border-slate-200 bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-b-8 border-amber-600 bg-amber-400 text-white">
            {passed ? <Trophy size={40} /> : <Shield size={40} />}
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-800">{passed ? "Topic Mastered" : "Almost There"}</h1>
          <p className="mt-2 text-lg font-semibold text-slate-600">Score: {score}%</p>

          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
            {passed
              ? "Excellent work. You passed the gatekeeper test and can move forward to the next challenge."
              : "You are close. Review this topic once more and try again to unlock the next milestone."}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push(`/topics/${topicId}`)}
              className="rounded-xl border-b-4 border-slate-600 bg-slate-500 px-5 py-3 font-black text-white"
            >
              Review Topic
            </button>
            <button
              type="button"
              onClick={completeAndGoTopics}
              className={cn(
                "rounded-xl border-b-4 px-5 py-3 font-black text-white",
                passed ? "border-emerald-700 bg-emerald-600" : "border-violet-700 bg-violet-600"
              )}
            >
              {passed ? "Continue" : "Try Again Later"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_60%)] px-4 pb-8 pt-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-600">Test Mode</p>
              <h1 className="text-2xl font-black text-slate-800">Topic Gatekeeper</h1>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-black text-violet-700">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-500 to-amber-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)] sm:p-6">
          {currentQuestion.type === "MATCHING" ? (
            <MatchingQuestion
              key={currentQuestion._id}
              question={currentQuestion}
              targetLanguage={targetLanguage}
              fallbackLanguage={helperLanguage}
              onAnswered={onAnswered}
              disabled={currentAnswered !== null}
            />
          ) : (
            <ClozeQuestion
              key={currentQuestion._id}
              question={currentQuestion}
              targetLanguage={targetLanguage}
              fallbackLanguage={helperLanguage}
              onAnswered={onAnswered}
              disabled={currentAnswered !== null}
            />
          )}

          {currentAnswered !== null ? (
            <div
              className={cn(
                "mt-6 rounded-xl border px-4 py-3 text-sm font-semibold",
                currentAnswered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              {currentAnswered
                ? "Correct. Keep going."
                : "Not quite. Keep moving and review after this test."}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={continueNext}
              disabled={currentAnswered === null}
              className={cn(
                "min-w-40 rounded-xl border-b-4 px-6 py-3 text-lg font-black text-white",
                currentAnswered === null
                  ? "cursor-not-allowed border-slate-300 bg-slate-300"
                  : "border-violet-700 bg-violet-600 hover:bg-violet-700"
              )}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
