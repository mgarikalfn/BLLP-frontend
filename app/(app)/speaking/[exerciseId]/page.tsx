"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SpeakingExerciseScreen } from "@/features/speaking/SpeakingExerciseScreen";
import { useSpeakingExercise } from "@/hooks/useSpeaking";
import { useLanguageStore } from "@/store/languageStore";
import { LocalizedString, SpeakingExercise } from "@/types/learning";

type LearningLanguage = "am" | "ao";

const pageText = {
  am: {
    invalidExerciseId: "የንግግር ልምምድ መለያ ልክ አይደለም።",
    loadFailed: "የንግግር ልምምድ መጫን አልተቻለም",
    tryAgain: "እባክዎ ደግመው ይሞክሩ።",
    backToTopic: "ወደ ርዕስ ተመለስ",
  },
  ao: {
    invalidExerciseId: "ID shaakala dubbii sirrii miti.",
    loadFailed: "Shaakala dubbii fe'uu hin dandeenye",
    tryAgain: "Mee irra deebi'i yaali.",
    backToTopic: "Gara mata duree deebi'i",
  },
} as const;

const resolveLocalizedText = (
  value: LocalizedString | string | undefined,
  targetLanguage: LearningLanguage,
  nativeLanguage: LearningLanguage
) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value[targetLanguage] || value[nativeLanguage] || value.am || value.ao || "";
};

const resolveExpectedText = (
  exercise: SpeakingExercise,
  targetLanguage: LearningLanguage,
  nativeLanguage: LearningLanguage
) => {
  const candidates: Array<LocalizedString | string | undefined> = [
    exercise.expectedText,
    exercise.prompt,
    exercise.text,
    exercise.script,
    exercise.title,
  ];

  for (const candidate of candidates) {
    const text = resolveLocalizedText(candidate, targetLanguage, nativeLanguage).trim();

    if (text.length > 0) {
      return text;
    }
  }

  return targetLanguage === "am"
    ? "እባክዎን የተሰጠውን ጽሑፍ ያንብቡ።"
    : "Mee barruu kenname dubbisi.";
};

const resolveTargetLanguage = (value: unknown, fallback: LearningLanguage): LearningLanguage => {
  if (value === "am" || value === "ao") {
    return value;
  }

  return fallback;
};

export default function SpeakingExercisePage() {
  const params = useParams<{ exerciseId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const language = useLanguageStore((state) => state.lang);
  const nativeLanguage: LearningLanguage = language === "ao" ? "ao" : "am";
  const localizedPageText = pageText[nativeLanguage];

  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const topicIdFromQuery = searchParams.get("topicId");

  const {
    data: exercise,
    isLoading,
    error,
  } = useSpeakingExercise(exerciseId || "");

  const resolvedTopicId = useMemo(() => {
    return exercise?.topicId || topicIdFromQuery || null;
  }, [exercise?.topicId, topicIdFromQuery]);

  const targetLanguage = useMemo<LearningLanguage>(() => {
    const fallbackLanguage: LearningLanguage = nativeLanguage === "am" ? "ao" : "am";
    return resolveTargetLanguage(exercise?.targetLang || exercise?.targetLanguage, fallbackLanguage);
  }, [exercise?.targetLang, exercise?.targetLanguage, nativeLanguage]);

  const expectedText = useMemo(() => {
    if (!exercise) {
      return "";
    }

    return resolveExpectedText(exercise, targetLanguage, nativeLanguage);
  }, [exercise, targetLanguage, nativeLanguage]);

  const handleBack = () => {
    if (resolvedTopicId) {
      router.push(`/topics/${resolvedTopicId}`);
      return;
    }

    router.push("/topics");
  };

  const handleComplete = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] }),
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace", "infinite"] }),
    ]);

    handleBack();
  };

  if (!exerciseId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white px-4 text-center">
        <p className="text-lg font-semibold text-red-500">{localizedPageText.invalidExerciseId}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h2 className="text-xl font-black text-slate-700">{localizedPageText.loadFailed}</h2>
        <p className="max-w-sm text-sm font-medium text-slate-500">
          {error instanceof Error ? error.message : localizedPageText.tryAgain}
        </p>
        <Button onClick={handleBack} variant="primary" size="lg">
          {localizedPageText.backToTopic}
        </Button>
      </div>
    );
  }

  return (
    <SpeakingExerciseScreen
      expectedText={expectedText}
      targetLang={targetLanguage}
      exerciseId={exercise._id}
      onComplete={handleComplete}
    />
  );
}
