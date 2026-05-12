"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDialogueById, getDialoguesByTopic, generateDialogueAudio, regenerateDialogueAudio } from "@/api/dialogue.api";
import { Dialogue } from "@/types/learning";

export const useDialoguesByTopic = (topicId: string, enabled: boolean = true) => {
  return useQuery<Dialogue[], Error>({
    queryKey: ["dialogues", "topic", topicId],
    queryFn: () => getDialoguesByTopic(topicId),
    enabled: !!topicId && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDialogueById = (dialogueId: string) => {
  return useQuery<Dialogue, Error>({
    queryKey: ["dialogue", dialogueId],
    queryFn: () => getDialogueById(dialogueId),
    enabled: !!dialogueId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGenerateDialogueAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dialogueId: string) => generateDialogueAudio(dialogueId),
    onSuccess: (data) => {
      // Invalidate and refetch dialogue queries
      queryClient.invalidateQueries({ queryKey: ["dialogue", data._id] });
      queryClient.invalidateQueries({ queryKey: ["dialogues", "topic", data.topicId] });
    },
  });
};

export const useRegenerateDialogueAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dialogueId, lineIndex, language }: { dialogueId: string; lineIndex: number; language: "am" | "ao" }) =>
      regenerateDialogueAudio(dialogueId, lineIndex, language),
    onSuccess: (data) => {
      // Invalidate and refetch dialogue queries
      queryClient.invalidateQueries({ queryKey: ["dialogue", data._id] });
      queryClient.invalidateQueries({ queryKey: ["dialogues", "topic", data.topicId] });
    },
  });
};
