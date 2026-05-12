import { api } from "@/lib/api";
import { Dialogue, ApiResponse } from "@/types/learning";

type DialoguePayload = ApiResponse<Dialogue | Dialogue[]> | Dialogue | Dialogue[];

const normalizeDialoguesPayload = (payload: DialoguePayload): Dialogue[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ("success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Failed to fetch dialogues");
    }

    return Array.isArray(payload.data) ? payload.data : [payload.data];
  }

  return [payload];
};

export const getDialoguesByTopic = async (topicId: string): Promise<Dialogue[]> => {
  const res = await api.get<DialoguePayload>(`/dialogues/topic/${topicId}`);

  return normalizeDialoguesPayload(res.data);
};

export const getDialogueById = async (dialogueId: string): Promise<Dialogue> => {
  const res = await api.get<ApiResponse<Dialogue> | Dialogue>(`/dialogues/${dialogueId}`);
  const [dialogue] = normalizeDialoguesPayload(res.data);

  if (!dialogue) {
    throw new Error("Dialogue not found");
  }

  return dialogue;
};

export const generateDialogueAudio = async (dialogueId: string): Promise<Dialogue> => {
  const res = await api.put<ApiResponse<Dialogue>>(`/dialogues/${dialogueId}/generate-audio`);
  
  if ("success" in res.data && !res.data.success) {
    throw new Error(res.data.message || "Failed to generate dialogue audio");
  }

  return "data" in res.data ? res.data.data : res.data as Dialogue;
};

export const regenerateDialogueAudio = async (
  dialogueId: string,
  lineIndex: number,
  language: "am" | "ao"
): Promise<Dialogue> => {
  const res = await api.put<ApiResponse<Dialogue>>(
    `/dialogues/${dialogueId}/regenerate-audio`,
    { lineIndex, language }
  );
  
  if ("success" in res.data && !res.data.success) {
    throw new Error(res.data.message || "Failed to regenerate dialogue audio");
  }

  return "data" in res.data ? res.data.data : res.data as Dialogue;
};
