"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitWritingExercise } from "@/api/writing.api";
import { useWritingExercise } from "@/hooks/useWriting";
import { useLanguageStore } from "@/store/languageStore";
import { WritingExercise, WritingFeedbackResult } from "@/types/learning";
import { FeedbackCard, isPassingFeedback } from "./FeedbackCard";
import { PromptHeader } from "./components/PromptHeader";

interface WritingExerciseScreenProps {
  exerciseId: string;
  topicId?: string;
  onComplete: (payload: {
    topicId: string;
    exerciseId: string;
    feedback: WritingFeedbackResult;
    
  }) => void;
}

type LearningLanguage = "am" | "ao";

const nativeInstructions: Record<LearningLanguage, Record<WritingExercise["type"], string>> = {
  am: {
    TRANSLATION: "ይህን ዓረፍተ ነገር ተርጉሙ",
    OPEN_PROMPT: "በራስዎ ቃላት ምላሽ ይጻፉ",
  },
  ao: {
    TRANSLATION: "Himicha kana hiiki",
    OPEN_PROMPT: "Jechoota keessaniin deebii barreessaa",
  },
};

const playSuccessSound = () => {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(660, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.22);

  window.setTimeout(() => {
    void context.close();
  }, 260);
};

export const WritingExerciseScreen = ({ exerciseId, topicId, onComplete }: WritingExerciseScreenProps) => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<WritingFeedbackResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playedAttemptRef = useRef<string | null>(null);

  const nativeLanguage = useLanguageStore((state) => state.lang);
  const targetLanguage: LearningLanguage = nativeLanguage === "am" ? "ao" : "am";

  const {
    data: exercise,
    isLoading: isExerciseLoading,
    isError,
    error,
    refetch,
  } = useWritingExercise(exerciseId);

  const resolvedTopicId = topicId || exercise?.topicId || "";

  const isContinueState = feedbackResult ? isPassingFeedback(feedbackResult) : false;

  const promptText = useMemo(() => {
    if (!exercise) return "";
    return exercise.prompt[targetLanguage] || exercise.prompt[nativeLanguage] || exercise.prompt.am;
  }, [exercise, targetLanguage, nativeLanguage]);

  const promptTranslation = useMemo(() => {
    if (!exercise) return undefined;
    return exercise.prompt[nativeLanguage] || undefined;
  }, [exercise, nativeLanguage]);

  const shouldShowSampleAnswer = useMemo(() => {
    if (!feedbackResult || !exercise) {
      return false;
    }

    if (feedbackResult.status === "TYPO") {
      return true;
    }

    const isIncorrectEvaluation =
      feedbackResult.status === "INCORRECT" || (feedbackResult.status === "EVALUATED" && !feedbackResult.isCorrect);

    return isIncorrectEvaluation && exercise.type === "TRANSLATION";
  }, [feedbackResult, exercise]);

  useEffect(() => {
    if (!feedbackResult || !isPassingFeedback(feedbackResult)) {
      return;
    }

    if (playedAttemptRef.current === feedbackResult.attemptId) {
      return;
    }

    playedAttemptRef.current = feedbackResult.attemptId;
    playSuccessSound();
  }, [feedbackResult]);

  const handleSubmit = async () => {
    if (!exercise || isLoading) return;

    if (isContinueState && feedbackResult) {
      if (!resolvedTopicId) {
        setErrorMessage("Unable to continue because topic context is missing.");
        return;
      }

      onComplete({
        topicId: resolvedTopicId,
        exerciseId: exercise._id,
        feedback: feedbackResult,
      });
      return;
    }

    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await submitWritingExercise({
        exerciseId: exercise._id,
        topicId: resolvedTopicId || exercise.topicId,
        submittedText: trimmedInput,
        targetLanguage,
        nativeLanguage,
      });

      setFeedbackResult(response.data);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to submit writing.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isExerciseLoading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-green-500" size={42} />
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border-2 border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-lg font-black text-rose-700">Failed to load writing exercise.</p>
        <p className="mt-2 text-sm font-medium text-rose-600">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <Button className="mt-5" variant="danger" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const instruction = nativeInstructions[nativeLanguage][exercise.type];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      <PromptHeader
        instruction={instruction}
        promptText={promptText}
        promptTranslation={promptTranslation !== promptText ? promptTranslation : undefined}
      />

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
        <label htmlFor="writing-answer" className="text-xs font-black uppercase tracking-widest text-slate-500">
          Your response
        </label>
        <textarea
          id="writing-answer"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          disabled={isLoading}
          rows={8}
          placeholder={targetLanguage === "am" ? "እዚህ ይጻፉ..." : "Asitti barreessi..."}
          className="mt-3 w-full resize-y rounded-xl border-2 border-slate-200 p-4 text-lg font-semibold text-slate-800 outline-none transition-colors focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>

      {feedbackResult && <FeedbackCard result={feedbackResult} showSampleAnswer={shouldShowSampleAnswer} />}

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        variant={isContinueState ? "secondary" : "primary"}
        onClick={handleSubmit}
        disabled={isLoading || (!isContinueState && inputText.trim().length === 0)}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Grading...
          </span>
        ) : isContinueState ? (
          "Continue"
        ) : (
          "Check Answer"
        )}
      </Button>
    </div>
  );
};
