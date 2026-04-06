"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitWritingExercise } from "@/hooks/useWriting";
import { useLanguageStore } from "@/store/languageStore";
import { WritingExercise, WritingFeedbackResult, WritingSubmitPayload } from "@/types/learning";
import { PromptHeader } from "./PromptHeader";
import { FeedbackCard, isSuccessfulWritingResult } from "./FeedbackCard";

interface WritingExerciseScreenProps {
  exercise: WritingExercise;
  onComplete: () => void;
}

const playSuccessTone = () => {
  if (typeof window === "undefined" || !window.AudioContext) {
    return;
  }

  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(523.25, context.currentTime);
  oscillator.frequency.linearRampToValueAtTime(659.25, context.currentTime + 0.12);
  oscillator.frequency.linearRampToValueAtTime(783.99, context.currentTime + 0.24);

  gainNode.gain.setValueAtTime(0.001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.32);

  oscillator.onended = () => {
    context.close().catch(() => undefined);
  };
};

export const WritingExerciseScreen = ({ exercise, onComplete }: WritingExerciseScreenProps) => {
  const lang = useLanguageStore((state) => state.lang);
  const submitMutation = useSubmitWritingExercise();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<WritingFeedbackResult | null>(null);

  const nativeLanguage = exercise.nativeLanguage || lang;
  const targetLanguage = exercise.targetLanguage || (nativeLanguage === "am" ? "ao" : "am");

  const promptText = exercise.prompt[targetLanguage] || exercise.prompt.am || exercise.prompt.ao;
  const promptTranslation = exercise.prompt[nativeLanguage] || undefined;
  const instructionText =
    exercise.instruction?.[nativeLanguage] ||
    (exercise.type === "TRANSLATION" ? "Translate this sentence" : "Write your response");

  const isPassingResult = useMemo(() => {
    if (!feedbackResult) {
      return false;
    }

    return isSuccessfulWritingResult(feedbackResult);
  }, [feedbackResult]);

  const handleSubmit = async () => {
    if (isPassingResult) {
      onComplete();
      return;
    }

    const trimmedInput = inputText.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    setIsLoading(true);

    const payload: WritingSubmitPayload = {
      exerciseId: exercise._id,
      topicId: exercise.topicId,
      submittedText: trimmedInput,
      targetLanguage,
      nativeLanguage,
    };

    try {
      const response = await submitMutation.mutateAsync(payload);
      setFeedbackResult(response.data);

      if (isSuccessfulWritingResult(response.data)) {
        playSuccessTone();
      }
    } catch (error) {
      setFeedbackResult({
        isCorrect: false,
        status: "INCORRECT",
        feedback: error instanceof Error ? error.message : "Unable to grade your answer right now.",
        sampleAnswer: "",
        attemptId: "submission-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
      <div className="space-y-5">
        <PromptHeader
          instruction={instructionText}
          promptText={promptText}
          promptTranslation={promptTranslation !== promptText ? promptTranslation : undefined}
        />

        <section className="rounded-2xl border-2 border-slate-200 bg-white p-5">
          <label htmlFor="writing-input" className="text-xs font-black uppercase tracking-widest text-slate-400">
            Your Answer
          </label>

          <textarea
            id="writing-input"
            value={inputText}
            disabled={isLoading}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Type your translation or creative response here..."
            className="mt-3 min-h-40 w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800 outline-none transition-colors focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          />
        </section>

        {feedbackResult ? <FeedbackCard result={feedbackResult} /> : null}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || (!isPassingResult && inputText.trim().length === 0)}
          variant={isPassingResult ? "secondary" : "primary"}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Grading...
            </>
          ) : isPassingResult ? (
            "Continue"
          ) : (
            "Check Answer"
          )}
        </Button>
      </div>
    </div>
  );
};
