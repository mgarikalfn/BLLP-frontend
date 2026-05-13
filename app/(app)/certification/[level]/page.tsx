"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Timer } from "lucide-react";
import { startCertification, submitCertification } from "@/api/certification.api";
import { QuestionHost } from "@/features/lesson/components/QuestionHost";
import { LessonQuestion } from "@/types/learning";

const DEFAULT_DURATION_SECONDS = 45 * 60;

type RawCertificationQuestion = {
  _id?: string;
  id?: string;
  type?: string;
  content?: any;
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
  score?: number;
  certificateId?: string;
  certificate?: { _id?: string; id?: string };
  message?: string;
};

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const normalizeQuestions = (raw: any[]): LessonQuestion[] => {
  return raw.map((item, index) => {
    return {
      _id: item._id || item.id || `question-${index + 1}`,
      type: item.type || "MULTIPLE_CHOICE",
      content: item.content || {},
    };
  });
};

const fetchCertificationAttempt = async (level: string) => startCertification(level);

export default function CertificationTestPage() {
  const params = useParams<{ level: string }>();
  const router = useRouter();
  const submitLocked = useRef(false);

  const levelParam = Array.isArray(params.level) ? params.level[0] : params.level;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<any>>([]);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION_SECONDS);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ passed: boolean; score: number; certificateId?: string } | null>(null);

  useEffect(() => {
    const loadAttempt = async () => {
      if (!levelParam) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const resolved = (await fetchCertificationAttempt(levelParam)) as CertificationAttemptPayload;
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
    if (!attemptId || !questions.length || isSubmitting || testResult) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attemptId, questions.length, isSubmitting, testResult]);

  useEffect(() => {
    if (secondsLeft !== 0 || submitLocked.current) return;
    void handleSubmit(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (!testResult) return;

    const timer = window.setTimeout(() => {
      if (testResult.passed && testResult.certificateId) {
        router.push(`/certificate/${testResult.certificateId}`);
      } else {
        router.push("/dashboard");
      }
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [testResult, router]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const progressValue = useMemo(() => {
    if (!totalSeconds) return 0;
    return totalSeconds - secondsLeft;
  }, [secondsLeft, totalSeconds]);

  const handleSelectAnswer = (answerGiven: any) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = answerGiven;
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
          questionId: question._id,
          answerGiven: userAnswers[index],
        })),
        autoSubmit,
      };

      const data = (await submitCertification(attemptId, payload)) as CertificationSubmitResponse;
      const certificateId =
        data.certificateId || data.certificate?._id || data.certificate?.id;

      setTestResult({
        passed: data.passed || false,
        score: data.score || 0,
        certificateId,
      });
    } catch (error) {
      setLoadError("Submission failed. Please check your connection and try again.");
      submitLocked.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          <p className="text-sm font-semibold text-gray-500">Loading certification test...</p>
        </div>
      </div>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 px-4 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
            <AlertTriangle />
          </div>
          <p className="text-sm font-semibold text-red-600">
            {loadError || "Unable to load certification test."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Certification</p>
            <h1 className="text-lg font-black text-gray-900 sm:text-xl">{levelParam?.toUpperCase()} Focus Test</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            <Timer className="h-4 w-4" />
            {formatTimer(secondsLeft)}
          </div>
        </div>
        <progress
          max={totalSeconds}
          value={progressValue}
          className="h-2 w-full bg-gray-100 text-blue-500 [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-blue-500"
        />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="w-full">
          <QuestionHost
            key={currentQuestion._id}
            question={currentQuestion}
            onComplete={(_, answerGiven) => handleSelectAnswer(answerGiven)}
            disabled={isSubmitting}
            testMode={true}
          />
        </div>

        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400">
            Your progress is autosaved until submission.
          </p>
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedAnswer === null || selectedAnswer === undefined || isSubmitting}
            className={`rounded-xl px-8 py-3 text-sm font-black uppercase tracking-widest transition-all ${
              selectedAnswer === null || selectedAnswer === undefined || isSubmitting
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20"
            }`}
          >
            {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit" : "Next"}
          </button>
        </div>
      </div>

      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-2xl">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${testResult.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="mt-6 text-2xl font-black text-gray-900">
              {testResult.passed ? "Certification Passed!" : "Test Not Passed"}
            </h3>
            
            <div className="mt-4 flex flex-col items-center justify-center gap-1 rounded-2xl bg-gray-50 py-4">
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Your Score</p>
              <p className={`text-4xl font-black ${testResult.passed ? 'text-green-600' : 'text-red-500'}`}>
                {testResult.score}%
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-1">Passing score: 80%</p>
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-500">
              {testResult.passed 
                ? "Congratulations! Redirecting to your certificate..." 
                : "Don't worry! Review your materials and try again. Redirecting you to the dashboard..."}
            </p>
            
            <button
              type="button"
              onClick={() => testResult.passed && testResult.certificateId ? router.push(`/certificate/${testResult.certificateId}`) : router.push("/dashboard")}
              className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${
                testResult.passed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {testResult.passed ? "View Certificate" : "Return to Dashboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
