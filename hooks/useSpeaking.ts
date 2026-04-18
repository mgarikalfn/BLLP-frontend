"use client";

import { useQuery } from "@tanstack/react-query";
import { getSpeakingExercise } from "@/api/speaking.api";
import { SpeakingExercise } from "@/types/learning";

export const useSpeakingExercise = (exerciseId: string) => {
  return useQuery<SpeakingExercise, Error>({
    queryKey: ["speaking", "exercise", exerciseId],
    queryFn: () => getSpeakingExercise(exerciseId),
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000,
  });
};
