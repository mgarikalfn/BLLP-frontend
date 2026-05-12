"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Timer } from "lucide-react";
import { api } from "@/lib/api";

const DEFAULT_DURATION_SECONDS = 45 * 60;

type RawCertificationQuestion = {
  _id?: string;
  id?: string;
  prompt?: string;
  question?: string;
  text?: string;
  options?: string[];
  choices?: string[];
  answers?: string[];
};

type CertificationQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type CertificationAttemptPayload = {
  attemptId?: string;
  id?: string;
  questions?: RawCertificationQuestion[];
  durationSeconds?: number;
  timeLimitSeconds?: number;
  timeLimit?: number;
};

type CertificationSubmitResponse = {
  passed?: boolean;
  certificateId?: string;
  certificate?: { _id?: string; id?: string };
  message?: string;
};

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const normalizeQuestions = (raw: RawCertificationQuestion[]): CertificationQuestion[] => {
  return raw
    .map((item, index) => {
      const id = item._id || item.id || `question-${index + 1}`;
      const prompt = item.prompt || item.question || item.text || "Untitled question";
      const options = item.options || item.choices || item.answers || [];

      if (!options.length) return null;

      return { id, prompt, options };
    })
    .filter((item): item is CertificationQuestion => item !== null);
};

const fetchCertificationAttempt = async (level: string) => {
  const endpoints = [
    `/certifications/${level}`,
    `/api/certifications/${level}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to load certification test.");
};

const submitCertificationAttempt = async (attemptId: string, payload: unknown) => {
  const endpoints = [
    `/api/certifications/${attemptId}/submit`,
    `/certifications/${attemptId}/submit`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await api.post(endpoint, payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to submit certification test.");
};

export default function CertificationTestPage() {
  const params = useParams<{ level: string }>();
  const router = useRouter();
  const submitLocked = useRef(false);

  const levelParam = Array.isArray(params.level) ? params.level[0] : params.level;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<CertificationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<number | null>>([]);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION_SECONDS);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  useEffect(() => {
    const loadAttempt = async () => {
      if (!levelParam) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const payload = (await fetchCertificationAttempt(levelParam)) as {
          data?: CertificationAttemptPayload;
        } & CertificationAttemptPayload;

        const resolved = ("data" in payload ? payload.data : payload) || {};
        const resolvedQuestions = normalizeQuestions(resolved.questions || []);

        if (!resolvedQuestions.length) {
          throw new Error("No certification questions returned.");
        }

        const duration =
          resolved.durationSeconds ||
          resolved.timeLimitSeconds ||
          resolved.timeLimit ||
          DEFAULT_DURATION_SECONDS;

        setAttemptId(resolved.attemptId || resolved.id || null);
        setQuestions(resolvedQuestions);
        setUserAnswers(new Array(resolvedQuestions.length).fill(null));
        setSecondsLeft(duration);
        setTotalSeconds(duration);
        setCurrentQuestionIndex(0);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load certification test.";
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAttempt();
  }, [levelParam]);

  useEffect(() => {
    if (!attemptId || !questions.length || isSubmitting || showFailModal) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attemptId, questions.length, isSubmitting, showFailModal]);

  useEffect(() => {
    if (secondsLeft !== 0 || submitLocked.current) return;
    void handleSubmit(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (!showFailModal) return;

    const timer = window.setTimeout(() => {
      router.push("/dashboard");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [showFailModal, router]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const progressValue = useMemo(() => {
    if (!totalSeconds) return 0;
    return totalSeconds - secondsLeft;
  }, [secondsLeft, totalSeconds]);

  const handleSelectAnswer = (index: number) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = index;
      return next;
    });
  };

  const handleNext = () => {
    if (selectedAnswer === null || isSubmitting) return;

    if (isLastQuestion) {
      void handleSubmit(false);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleSubmit = async (autoSubmit: boolean) => {
    if (!attemptId || submitLocked.current) return;

    submitLocked.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        answers: questions.map((question, index) => ({
          questionId: question.id,
          answerIndex: userAnswers[index] ?? -1,
          answerText:
            userAnswers[index] !== null
              ? question.options[userAnswers[index] as number]
              : null,
        })),
        autoSubmit,
      };

      const res = await submitCertificationAttempt(attemptId, payload);
      const data = (res?.data || res) as CertificationSubmitResponse;
      const certificateId =
        data.certificateId || data.certificate?._id || data.certificate?.id;

      if (data.passed && certificateId) {
        router.push(`/certificate/${certificateId}`);
        return;
      }

      setShowFailModal(true);
    } catch (error) {
      setLoadError("Submission failed. Please check your connection and try again.");
      submitLocked.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-sm font-semibold text-slate-300">Loading certification test...</p>
        </div>
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <AlertTriangle />
          </div>
          <p className="text-sm font-semibold text-rose-200">
            {loadError || "Unable to load certification test."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Certification</p>
            <h1 className="text-lg font-black text-white sm:text-xl">{levelParam?.toUpperCase()} Focus Test</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-emerald-200">
            <Timer className="h-4 w-4" />
            {formatTimer(secondsLeft)}
          </div>
        </div>
        <progress
          max={totalSeconds}
          value={progressValue}
          className="h-3 w-full bg-slate-900 text-emerald-400"
        />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">{currentQuestion.prompt}</h2>
        </div>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <button
                key={`${currentQuestion.id}-option-${index}`}
                type="button"
                onClick={() => handleSelectAnswer(index)}
                className={`rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-all sm:text-lg ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                    : "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700"
                }`}
              >
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-sm font-black">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className="text-xs font-semibold text-slate-500">
            Your progress is autosaved until submission.
          </p>
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedAnswer === null || isSubmitting}
            className={`rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all ${
              selectedAnswer === null || isSubmitting
                ? "cursor-not-allowed bg-slate-800 text-slate-500"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            }`}
          >
            {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit" : "Next"}
          </button>
        </div>
      </div>

      {showFailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <AlertTriangle />
            </div>
            <h3 className="mt-4 text-xl font-black text-white">Certification Not Passed</h3>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              You can attempt the certification again later. Redirecting to the dashboard...
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
