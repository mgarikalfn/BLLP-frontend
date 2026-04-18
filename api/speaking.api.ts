import axios from "axios";
import { api } from "@/lib/api";
import { ApiResponse, SpeakingExercise } from "@/types/learning";

type NestedSpeakingExercisePayload = {
  exercise?: SpeakingExercise;
  speakingExercise?: SpeakingExercise;
};

type SpeakingExercisePayload =
  | ApiResponse<SpeakingExercise | NestedSpeakingExercisePayload>
  | SpeakingExercise
  | NestedSpeakingExercisePayload;

const isSpeakingExercise = (
  payload: SpeakingExercise | NestedSpeakingExercisePayload
): payload is SpeakingExercise => {
  return "_id" in payload && typeof payload._id === "string";
};

const extractSpeakingExercise = (
  payload: SpeakingExercise | NestedSpeakingExercisePayload
): SpeakingExercise => {
  if (isSpeakingExercise(payload)) {
    return payload;
  }

  if (payload.speakingExercise) {
    return payload.speakingExercise;
  }

  if (payload.exercise) {
    return payload.exercise;
  }

  throw new Error("Unexpected speaking exercise payload shape");
};

const normalizeSpeakingExercisePayload = (payload: SpeakingExercisePayload): SpeakingExercise => {
  if ("success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Failed to fetch speaking exercise");
    }

    return extractSpeakingExercise(payload.data);
  }

  return extractSpeakingExercise(payload);
};

const speakingExerciseEndpoints = (exerciseId: string) => [
  `/speaking/${exerciseId}`,
  `/speaking-exercise/${exerciseId}`,
  `/speaking/exercise/${exerciseId}`,
];

export const getSpeakingExercise = async (exerciseId: string): Promise<SpeakingExercise> => {
  if (!exerciseId) {
    throw new Error("Speaking exercise id is required");
  }

  let notFoundCount = 0;

  for (const endpoint of speakingExerciseEndpoints(exerciseId)) {
    try {
      const res = await api.get<SpeakingExercisePayload>(endpoint);
      return normalizeSpeakingExercisePayload(res.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        notFoundCount += 1;
        continue;
      }

      throw error;
    }
  }

  if (notFoundCount > 0) {
    throw new Error("Speaking exercise not found");
  }

  throw new Error("Failed to fetch speaking exercise");
};
