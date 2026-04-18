"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useWritingExercise } from "@/hooks/useWriting";
import { WritingExerciseScreen } from "@/features/writing/components/WritingExerciseScreen";
import { useProgressStore } from "@/store/progressStore";

export default function WritingExercisePage() {
  const params = useParams<{ exerciseId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const topicIdFromQuery = searchParams.get("topicId");

  const markCompleted = useProgressStore((state) => state.markCompleted);

  const {
    data: exercise,
    isLoading,
    error,
  } = useWritingExercise(exerciseId || "");

  const resolvedTopicId = useMemo(() => {
    return exercise?.topicId || topicIdFromQuery || null;
  }, [exercise?.topicId, topicIdFromQuery]);

  const handleBack = () => {
    if (resolvedTopicId) {
      router.push(`/topics/${resolvedTopicId}`);
      return;
    }

    router.push("/topics");
  };

  const handleComplete = async () => {
    if (exercise?._id) {
      markCompleted(exercise._id);
    }
    
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] }),
      queryClient.invalidateQueries({ queryKey: ["topicWorkspace", "infinite"] }),
    ]);

    handleBack();
  };

  if (!exerciseId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white px-4 text-center">
        <p className="text-lg font-semibold text-red-500">Invalid writing exercise id.</p>
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
        <h2 className="text-xl font-black text-slate-700">Failed to load writing exercise</h2>
        <p className="max-w-sm text-sm font-medium text-slate-500">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <Button onClick={handleBack} variant="primary" size="lg">
          Back To Topic
        </Button>
      </div>
    );
  }

  return <WritingExerciseScreen exercise={exercise} onComplete={handleComplete} />;
}
