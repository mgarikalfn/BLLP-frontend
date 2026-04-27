"use client";

import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useDialogueById, useDialoguesByTopic } from "@/hooks/useDialogue";
import { Dialogue } from "@/types/learning";
import { LessonLayout } from "@/features/lesson/components/LessonLayout";
import { LessonFooter } from "@/features/lesson/components/LessonFooter";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";

type DialogueStatus = "idle" | "correct" | "incorrect" | "completed";

type DialogueSlide = {
  id: string;
  dialogueId: string;
  scenario: Dialogue["scenario"];
  speakerName: string;
  speakerAvatarUrl?: string;
  line: Dialogue["lines"][number];
};

type LearningLanguage = "am" | "ao";

const getLocalizedText = (
  value: { am: string; ao: string } | undefined,
  primaryLanguage: LearningLanguage,
  fallbackLanguage: LearningLanguage
) => {
  if (!value) return "";
  return value[primaryLanguage] || value[fallbackLanguage] || value.am || value.ao || "";
};

const dialogueUiText = {
  am: {
    scenario: "ሁኔታ",
    speaker: "ተናጋሪ",
    yourResponse: "የእርስዎ ምላሽ",
    chooseBestResponse: "በጣም ተገቢውን ምላሽ ይምረጡ",
    dialogueCompleted: "ውይይቱ ተጠናቋል",
    greatJob: "በውይይቱ ውስጥ በማለፍዎ ጥሩ ስራ ሰርተዋል!",
    returnToTopic: "ወደ ርዕስ ተመለስ",
  },
  ao: {
    scenario: "Haala",
    speaker: "Dubbataa",
    yourResponse: "Deebii Kee",
    chooseBestResponse: "Deebii gaarii ta'e filadhu",
    dialogueCompleted: "Mariin xumurameera",
    greatJob: "Marii kana keessa darbuu keetiif hojii gaarii hojjetteetta!",
    returnToTopic: "Gara mata dureetti deebi'i",
  },
} as const;

const normalizeAvatarPath = (avatarPath?: string) => {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  return avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
};

const getDefaultAvatar = (characterId: string) => {
  const lastChar = characterId.charAt(characterId.length - 1);

  if (/\d/.test(lastChar)) {
    return Number(lastChar) % 2 === 0 ? "/woman.svg" : "/man.svg";
  }

  return lastChar.toLowerCase().charCodeAt(0) % 2 === 0 ? "/woman.svg" : "/man.svg";
};

export default function DialoguePage() {
  const params = useParams<{ topicId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const dialogueId = searchParams.get("dialogueId");
  const hasDialogueId = Boolean(dialogueId);
  const nativeLanguage = useLanguageStore((state) => state.lang);
  const targetLanguage = useLanguageStore((state) => state.targetLang);
  const uiText = dialogueUiText[nativeLanguage];

  const {
    data: dialogueById,
    isLoading: isDialogueByIdLoading,
    error: dialogueByIdError,
  } = useDialogueById(dialogueId || "");

  const {
    data: dialogues = [],
    isLoading: isTopicDialoguesLoading,
    error: topicDialoguesError,
  } = useDialoguesByTopic(topicId || "", !hasDialogueId);

  const isLoading = hasDialogueId ? isDialogueByIdLoading : isTopicDialoguesLoading;
  const error = hasDialogueId ? dialogueByIdError : topicDialoguesError;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<DialogueStatus>("idle");
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionMeta, setCompletionMeta] = useState<{ xpEarned?: number; totalXP?: number } | null>(null);

  const selectedDialogue = useMemo(() => {
    if (dialogueById) {
      return dialogueById;
    }

    if (dialogues.length === 0) {
      return null;
    }

    if (dialogueId) {
      return dialogues.find((dialogue) => dialogue._id === dialogueId) || null;
    }

    return dialogues[0];
  }, [dialogueById, dialogues, dialogueId]);

  const slides = useMemo<DialogueSlide[]>(() => {
    if (!selectedDialogue) return [];

    const sortedLines = [...selectedDialogue.lines].sort((a, b) => a.order - b.order);

    return sortedLines.map((line, index) => {
      const speaker = selectedDialogue.characters.find((c) => c.characterId === line.characterId);

      return {
        id: `${selectedDialogue._id}-${line.order}-${index}`,
        dialogueId: selectedDialogue._id,
        scenario: selectedDialogue.scenario,
        speakerName: speaker?.name || "Unknown",
        speakerAvatarUrl: speaker?.avatarUrl,
        line,
      };
    });
  }, [selectedDialogue]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setStatus("idle");
  }, [topicId, dialogueId, selectedDialogue?._id]);

  const currentSlide = slides[currentIndex];
  const fallbackAvatarSrc = currentSlide ? getDefaultAvatar(currentSlide.line.characterId) : "/man.svg";
  const avatarSrc = currentSlide
    ? normalizeAvatarPath(currentSlide.speakerAvatarUrl) || fallbackAvatarSrc
    : fallbackAvatarSrc;
  const isInteractive = Boolean(currentSlide?.line.isInteractive && currentSlide.line.options?.length);
  const options = currentSlide?.line.options || [];
  const correctAnswerIndex = currentSlide?.line.correctAnswerIndex ?? -1;

  const correctAnswerText =
    status === "incorrect" && isInteractive && correctAnswerIndex >= 0
      ? getLocalizedText(options[correctAnswerIndex], targetLanguage, nativeLanguage)
      : undefined;

  const handleSelectOption = (index: number) => {
    if (status !== "idle") return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (!isInteractive || selectedOption === null) return;
    setStatus(selectedOption === correctAnswerIndex ? "correct" : "incorrect");
  };

  const submitDialogueCompletion = async () => {
    if (!selectedDialogue?._id || isCompleting) return;

    setIsCompleting(true);
    setCompletionError(null);

    try {
      const res = await api.post(`/dialogues/${selectedDialogue._id}/complete`);
      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data as { data?: { xpEarned?: number; totalXP?: number } }).data
          : (res.data as { xpEarned?: number; totalXP?: number });

      setCompletionMeta({
        xpEarned: payload?.xpEarned,
        totalXP: payload?.totalXP,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] }),
        queryClient.invalidateQueries({ queryKey: ["topicWorkspace", "infinite"] }),
      ]);
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to sync dialogue completion")
          : error instanceof Error
            ? error.message
            : "Failed to sync dialogue completion";

      setCompletionError(message);
      console.error("Failed to complete dialogue", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleContinue = async () => {
    if (currentIndex + 1 >= slides.length) {
      await submitDialogueCompletion();
      setStatus("completed");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setStatus("idle");
  };

  if (!topicId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white px-4 text-center">
        <p className="text-lg font-semibold text-red-500">Invalid topic id for dialogue.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white gap-4">
        <h2 className="text-xl font-bold text-gray-700">Failed to load dialogue</h2>
        <Button variant="primary" size="lg" onClick={() => router.push(`/topics/${topicId}`)}>
          Back To Topic
        </Button>
      </div>
    );
  }

  if (slides.length === 0) {
    if (dialogueId && !selectedDialogue) {
      return (
        <div className="flex flex-col h-screen w-full items-center justify-center bg-white gap-4 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-700">Dialogue not found for this topic.</h2>
          <Button variant="primary" size="lg" onClick={() => router.push(`/topics/${topicId}`)}>
            Back To Topic
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white gap-4 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-700">No dialogues found for this topic yet.</h2>
        <Button variant="primary" size="lg" onClick={() => router.push(`/topics/${topicId}`)}>
          Back To Topic
        </Button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-green-200 bg-green-50 p-8 text-center">
          <h1 className="text-3xl font-black text-green-600">{uiText.dialogueCompleted}</h1>
          <p className="mt-3 text-gray-600">{uiText.greatJob}</p>
          {completionMeta?.xpEarned !== undefined ? (
            <p className="mt-2 text-sm font-semibold text-green-700">
              XP Earned: +{completionMeta.xpEarned}
              {completionMeta.totalXP !== undefined ? ` | Total XP: ${completionMeta.totalXP}` : ""}
            </p>
          ) : null}
          {completionError ? (
            <div className="mt-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 text-left text-sm font-semibold text-red-700">
              Progress sync failed: {completionError}
              <Button className="mt-3 w-full" variant="secondary" size="lg" onClick={submitDialogueCompletion} disabled={isCompleting}>
                {isCompleting ? "Retrying..." : "Retry Sync"}
              </Button>
            </div>
          ) : null}
          <Button className="mt-6 w-full" variant="secondary" size="lg" onClick={() => router.push(`/topics/${topicId}`)}>
            {uiText.returnToTopic}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LessonLayout
      currentIndex={currentIndex}
      totalSlides={slides.length}
      topicId={topicId}
      footer={
        <LessonFooter
          status={status}
          onCheck={handleCheckAnswer}
          onContinue={handleContinue}
          disabled={isInteractive && selectedOption === null}
          isLearningSlide={!isInteractive}
          correctAnswerText={correctAnswerText}
        />
      }
    >
      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
        <div className="rounded-2xl border-2 border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">{uiText.scenario}</p>
          <p className="mt-2 text-lg font-bold text-gray-800">{getLocalizedText(currentSlide.scenario, targetLanguage, nativeLanguage)}</p>
          <p className="text-sm text-gray-500">{getLocalizedText(currentSlide.scenario, nativeLanguage, targetLanguage)}</p>
        </div>

        <div className="rounded-2xl border-2 border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <img
              key={`${currentSlide.id}-avatar`}
              src={avatarSrc}
              alt={currentSlide.speakerName}
              className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover"
              onError={(event) => {
                const image = event.currentTarget;

                if (image.dataset.fallbackApplied === "true") {
                  return;
                }

                image.dataset.fallbackApplied = "true";
                image.src = fallbackAvatarSrc;
              }}
            />

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">{uiText.speaker}</p>
              <p className="text-lg font-black text-gray-800">{currentSlide.speakerName}</p>
            </div>
          </div>

          <p className="text-2xl font-bold text-gray-900 leading-tight">{getLocalizedText(currentSlide.line.content, targetLanguage, nativeLanguage)}</p>
          <p className="mt-2 text-lg font-medium text-gray-500">{getLocalizedText(currentSlide.line.content, nativeLanguage, targetLanguage)}</p>
        </div>

        {isInteractive && (
          <div className="rounded-2xl border-2 border-orange-100 bg-orange-50/60 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-orange-500">{uiText.yourResponse}</p>
            <h2 className="mt-2 text-xl font-black text-gray-800">
              {getLocalizedText(currentSlide.line.question, nativeLanguage, targetLanguage) || uiText.chooseBestResponse}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {getLocalizedText(currentSlide.line.question, targetLanguage, nativeLanguage)}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = status === "correct" && isSelected;
                const isIncorrect = status === "incorrect" && isSelected;
                const showCorrect = status === "incorrect" && index === correctAnswerIndex;

                return (
                  <button
                    key={`${currentSlide.id}-${index}`}
                    type="button"
                    onClick={() => handleSelectOption(index)}
                    disabled={status !== "idle"}
                    className={cn(
                      "w-full rounded-xl border-2 border-b-4 p-4 text-left transition-all duration-150",
                      status === "idle" && "active:border-b-0 active:translate-y-1",
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-600"
                        : "border-gray-200 bg-white text-gray-700",
                      isCorrect && "border-green-500 bg-green-50 text-green-700",
                      isIncorrect && "border-red-500 bg-red-50 text-red-600 border-b-2 translate-y-1",
                      showCorrect && "border-green-500 bg-green-50 text-green-700"
                    )}
                  >
                    <span className="block text-lg font-bold">{getLocalizedText(option, targetLanguage, nativeLanguage)}</span>
                    <span className="block text-sm font-medium opacity-80">{getLocalizedText(option, nativeLanguage, targetLanguage)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </LessonLayout>
  );
}
