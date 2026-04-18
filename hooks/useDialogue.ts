"use client";

import { useQuery } from "@tanstack/react-query";
import { getDialogueById, getDialoguesByTopic } from "@/api/dialogue.api";
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
