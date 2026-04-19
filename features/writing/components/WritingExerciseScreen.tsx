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

type LearningLanguage = "am" | "ao";

const getLocalizedText = (
  value: { am: string; ao: string } | undefined,
  primaryLanguage: LearningLanguage,
  fallbackLanguage: LearningLanguage
) => {
  if (!value) return "";
  return value[primaryLanguage] || value[fallbackLanguage] || value.am || value.ao || "";
};

const writingUiText = {
  am: {
    fallbackInstruction: {
      TRANSLATION: "ይህን ዓረፍተ ነገር ተርጉሙ",
      OPEN_PROMPT: "በራስዎ ቃላት ምላሽ ይጻፉ",
    },
    responseLabel: "የእርስዎ ምላሽ",
    placeholder: "መልስዎን እዚህ ይጻፉ...",
    grading: "በመገምገም ላይ...",
    continue: "ቀጥል",
    checkAnswer: "መልስ ፈትሽ",
    submitError: "አሁን መልስዎን መገምገም አልተቻለም።",
  },
  ao: {
    fallbackInstruction: {
      TRANSLATION: "Himicha kana hiiki",
      OPEN_PROMPT: "Jechoota keessaniin deebii barreessaa",
    },
    responseLabel: "Deebii kee",
    placeholder: "Deebii kee asitti barreessi...",
    grading: "Madaalamaa jira...",
    continue: "Itti fufi",
    checkAnswer: "Deebii qori",
    submitError: "Amma deebii kee madaaluu hin dandeenye.",
  },
} as const;

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
  const learningDirection = useLanguageStore((state) => state.learningDirection);
  const nativeUiLanguage = useLanguageStore((state) => state.lang);
  const preferredTargetLanguage = useLanguageStore((state) => state.targetLang);
  const submitMutation = useSubmitWritingExercise();

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<WritingFeedbackResult | null>(null);

  const derivedNativeLanguage: LearningLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "am"
      : "ao"
    : nativeUiLanguage;
  const derivedTargetLanguage: LearningLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "ao"
      : "am"
    : preferredTargetLanguage;

  const targetLanguage: LearningLanguage =
    exercise.targetLanguage || derivedTargetLanguage;
  const nativeLanguage: LearningLanguage =
    exercise.nativeLanguage || derivedNativeLanguage;
  const uiText = writingUiText[nativeLanguage];

  // Opposite mode: display target language as primary with native helper translation.
  const promptDisplayLanguage: LearningLanguage = targetLanguage;
  const promptHelperLanguage: LearningLanguage =
    promptDisplayLanguage === "am" ? "ao" : "am";

  const promptText = getLocalizedText(exercise.prompt, promptDisplayLanguage, promptHelperLanguage);
  const promptTranslation = getLocalizedText(exercise.prompt, promptHelperLanguage, promptDisplayLanguage) || undefined;
  const instructionText =
    getLocalizedText(exercise.instruction, nativeLanguage, targetLanguage) ||
    uiText.fallbackInstruction[exercise.type];

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

    const submissionTargetLanguage: LearningLanguage = targetLanguage;
    const submissionNativeLanguage: LearningLanguage = nativeLanguage;

    const payload: WritingSubmitPayload = {
      exerciseId: exercise._id,
      topicId: exercise.topicId,
      submittedText: trimmedInput,
      targetLanguage: submissionTargetLanguage,
      nativeLanguage: submissionNativeLanguage,
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
        feedback: error instanceof Error ? error.message : uiText.submitError,
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
            {uiText.responseLabel}
          </label>

          <textarea
            id="writing-input"
            value={inputText}
            disabled={isLoading}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={uiText.placeholder}
            className="mt-3 min-h-40 w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800 outline-none transition-colors focus:border-sky-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          />
        </section>

        {feedbackResult ? <FeedbackCard result={feedbackResult} nativeLanguage={nativeLanguage} /> : null}

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
              {uiText.grading}
            </>
          ) : isPassingResult ? (
            uiText.continue
          ) : (
            uiText.checkAnswer
          )}
        </Button>
      </div>
    </div>
  );
};
