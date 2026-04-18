"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getWritingExercise, submitWritingExercise } from "@/api/writing.api";
import { WritingExercise, WritingSubmitPayload, WritingSubmitResponse } from "@/types/learning";

export const useWritingExercise = (exerciseId: string) => {
  return useQuery<WritingExercise, Error>({
    queryKey: ["writing", "exercise", exerciseId],
    queryFn: () => getWritingExercise(exerciseId),
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubmitWritingExercise = () => {
  return useMutation<WritingSubmitResponse, Error, WritingSubmitPayload>({
    mutationFn: submitWritingExercise,
  });
};
