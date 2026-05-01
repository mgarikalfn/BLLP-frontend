"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTopicTest } from "@/hooks/useTopicTest";
import { submitTopicTestResult } from "@/api/topicTest.api";
import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";
import { LocalizedOrString, MatchingQuestionContent, TopicTestClozeContent, TopicTestQuestion } from "@/types/learning";

type LearningLanguage = "am" | "ao";
type UiLanguage = LearningLanguage;

const PASS_THRESHOLD = 80;

const pageText = {
  am: {
    mode: "የምዘና ሁነታ",
    title: "የርዕስ ፈተና",
    subtitle: "የሚቀጥለውን ደረጃ ለመክፈት ይህን ፈተና ያልፉ።",
    progressLabel: "እድገት",
    stepLabel: "ጥያቄ",
    invalidTopic: "የርዕስ መለያው ትክክል አይደለም።",
    loading: "የፈተናው መረጃ በመጫን ላይ...",
    failed: "የርዕስ ፈተናውን መጫን አልተቻለም",
    noQuestions: "እስካሁን የፈተና ጥያቄዎች የሉም።",
    backToTopic: "ወደ ርዕሱ ተመለስ",
    finishedTitlePass: "ርዕሱን በትክክል ተማርክ",
    finishedTitleRetry: "በጣም ተቃርበሃል",
    score: "ውጤት",
    passedBody: "በጣም ጥሩ ስራ። ይህን መፈተኛ አልፈዋል እና ወደ ቀጣዩ ደረጃ መቀጠል ይችላሉ።",
    failedBody: "ተቃርበዋል። ይህን ርዕስ እንደገና ይድገሙ እና ቀጣዩን መደበኛ ለመክፈት ይሞክሩ።",
    reviewTopic: "ርዕሱን ይድገሙ",
    continue: "ቀጥል",
    tryAgainLater: "በኋላ ደግመህ ሞክር",
    correct: "ትክክል ነው። ቀጥል።",
    incorrect: "ትክክል አይደለም። ከዚህ በኋላ ርዕሱን ይድገሙ።",
    fillBlank: "ባዶውን ሙላ",
    typeAnswer: "መልስህን ጻፍ",
    check: "አረጋግጥ",
  },
  ao: {
    mode: "Haala Qormaataa",
    title: "Qormaata Mata Duree",
    subtitle: "Sadarkaa itti aanu banuuf qormaata kana darbii.",
    progressLabel: "Jijjiirama",
    stepLabel: "Gaaffii",
    invalidTopic: "Akkamtaa mata duree sirrii miti.",
    loading: "Deetaan qormaataa fe'amaa jira...",
    failed: "Qormaata mata duree fe'uu hin dandeenye",
    noQuestions: "Ammaaf gaaffileen qormaataa hin jiranu.",
    backToTopic: "Gara mata dureetti deebi'i",
    finishedTitlePass: "Mata duree kana sirriitti baratte",
    finishedTitleRetry: "Baay'ee dhiyaatteetta",
    score: "Qabxii",
    passedBody: "Hojiin kee gaarii dha. Qormaata kana darbiteetta, gara sadarkaa itti aanuutti deemuu dandeessa.",
    failedBody: "Dhiyaatteetta. Mata duree kana irra deebi'iitii sadarkaa itti aanu banuuf yaali.",
    reviewTopic: "Mata duree ilaali",
    continue: "Itti fufi",
    tryAgainLater: "Booda irra deebi'i",
    correct: "Sirrii dha. Itti fufi.",
    incorrect: "Sirrii miti. Kana booda mata duree ilaali.",
    fillBlank: "Bana keessaa guuti",
    typeAnswer: "Deebii kee barreessi",
    check: "Mirkaneessi",
  },
} as const;

const getPageText = (lang: UiLanguage) => pageText[lang];

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
  uiLanguage: UiLanguage;
  targetLanguage: LearningLanguage;
  fallbackLanguage: LearningLanguage;
  onAnswered: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const MatchingQuestion = ({
  question,
  uiLanguage,
  targetLanguage,
  fallbackLanguage,
  onAnswered,
  disabled = false,
}: MatchingQuestionProps) => {
  const content = question.content as MatchingQuestionContent;
  const prompt = getLocalizedText(content.prompt, targetLanguage, fallbackLanguage);
  const text = getPageText(uiLanguage);

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
      {prompt ? (
        <div className="mb-6 rounded-2xl border-2 border-green-100 bg-green-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">{text.mode}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-slate-900">{prompt}</h2>
        </div>
      ) : null}

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
  uiLanguage: UiLanguage;
  targetLanguage: LearningLanguage;
  fallbackLanguage: LearningLanguage;
  onAnswered: (isCorrect: boolean) => void;
  disabled?: boolean;
}

const ClozeQuestion = ({
  question,
  uiLanguage,
  targetLanguage,
  fallbackLanguage,
  onAnswered,
  disabled = false,
}: ClozeQuestionProps) => {
  const content = question.content as TopicTestClozeContent;
  const sentence = getLocalizedText(content.sentence, targetLanguage, fallbackLanguage);
  const translation = getLocalizedText(content.sentence, fallbackLanguage, targetLanguage);
  const answer = getLocalizedText(content.answer, targetLanguage, fallbackLanguage);
  const text = getPageText(uiLanguage);

  const [input, setInput] = useState("");

  const check = () => {
    if (disabled || !input.trim()) return;
    onAnswered(normalizeCompareValue(input) === normalizeCompareValue(answer));
  };

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border-2 border-violet-100 bg-violet-50/60 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-violet-600">{text.fillBlank}</p>
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
          placeholder={text.typeAnswer}
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
          {text.check}
        </button>
      </div>
    </div>
  );
};

export default function TopicTestPage() {
  const params = useParams<{ topicId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const markCompleted = useProgressStore((state) => state.markCompleted);
  const lang = useLanguageStore((state) => state.lang);
  const uiText = getPageText(lang);
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
      markCompleted(`${topicId}_test`);
      
      try {
        await submitTopicTestResult(topicId, true, score);
      } catch (err) {
        console.error("Failed to submit topic test result", err);
      }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] }),
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace", "infinite"] }),
    ]);

    router.push("/topics");
  };

  if (!topicId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 text-center">
        <p className="text-lg font-semibold text-rose-500">{uiText.invalidTopic}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 text-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <p className="text-sm font-semibold text-slate-500">{uiText.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 text-center">
        <h2 className="text-xl font-black text-slate-700">{uiText.failed}</h2>
        <p className="text-sm font-medium text-slate-500">{error.message}</p>
        <button
          type="button"
          onClick={() => router.push(`/topics/${topicId}`)}
          className="rounded-xl border-b-4 border-green-700 bg-green-600 px-6 py-3 font-black text-white hover:bg-green-700"
        >
          {uiText.backToTopic}
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 text-center">
        <h2 className="text-xl font-black text-slate-700">{uiText.noQuestions}</h2>
        <button
          type="button"
          onClick={() => router.push(`/topics/${topicId}`)}
          className="rounded-xl border-b-4 border-green-700 bg-green-600 px-6 py-3 font-black text-white hover:bg-green-700"
        >
          {uiText.backToTopic}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f5f3ff_0%,#ffffff_65%)] px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border-2 border-green-100 bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-b-8 text-white",
              passed ? "border-green-700 bg-green-500" : "border-amber-600 bg-amber-400"
            )}
          >
            {passed ? <Trophy size={40} /> : <Shield size={40} />}
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-800">
            {passed ? uiText.finishedTitlePass : uiText.finishedTitleRetry}
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            {uiText.score}: {score}%
          </p>

          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
            {passed ? uiText.passedBody : uiText.failedBody}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push(`/topics/${topicId}`)}
              className="rounded-xl border-b-4 border-slate-600 bg-slate-500 px-5 py-3 font-black text-white hover:bg-slate-600"
            >
              {uiText.reviewTopic}
            </button>
            <button
              type="button"
              onClick={completeAndGoTopics}
              className={cn(
                "rounded-xl border-b-4 px-5 py-3 font-black text-white",
                passed ? "border-emerald-700 bg-emerald-600" : "border-violet-700 bg-violet-600"
              )}
            >
              {passed ? uiText.continue : uiText.tryAgainLater}
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
        <header className="mb-6 rounded-3xl border-2 border-green-100 bg-white/95 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">{uiText.mode}</p>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{uiText.title}</h1>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">{uiText.subtitle}</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
              {uiText.stepLabel} {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              <span>{uiText.progressLabel}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-green-500 via-lime-500 to-amber-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)] sm:p-6">
          {currentQuestion.type === "MATCHING" ? (
            <MatchingQuestion
              key={currentQuestion._id}
              question={currentQuestion}
              uiLanguage={lang}
              targetLanguage={targetLanguage}
              fallbackLanguage={helperLanguage}
              onAnswered={onAnswered}
              disabled={currentAnswered !== null}
            />
          ) : (
            <ClozeQuestion
              key={currentQuestion._id}
              question={currentQuestion}
              uiLanguage={lang}
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
              {currentAnswered ? uiText.correct : uiText.incorrect}
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
              {uiText.continue}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
