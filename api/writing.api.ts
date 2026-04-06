import { api } from "@/lib/api";
import {
  ApiResponse,
  WritingExercise,
  WritingFeedbackResult,
  WritingSubmitPayload,
  WritingSubmitResponse,
} from "@/types/learning";

type WritingExercisePayload = ApiResponse<WritingExercise> | WritingExercise;

type WritingSubmitPayloadResponse =
  | WritingSubmitResponse
  | ApiResponse<WritingFeedbackResult>
  | WritingFeedbackResult;

const normalizeWritingExercisePayload = (payload: WritingExercisePayload): WritingExercise => {
  if ("success" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Failed to fetch writing exercise");
    }

    return payload.data;
  }

  return payload;
};

const normalizeWritingSubmitPayload = (
  payload: WritingSubmitPayloadResponse
): WritingSubmitResponse => {
  if ("success" in payload && "data" in payload) {
    if (!payload.success) {
      throw new Error(payload.message || "Failed to submit writing exercise");
    }

    return {
      success: true,
      data: payload.data,
      message: payload.message,
    };
  }

  return {
    success: true,
    data: payload,
  };
};

export const getWritingExercise = async (exerciseId: string): Promise<WritingExercise> => {
  const res = await api.get<WritingExercisePayload>(`/writing/${exerciseId}`);

  return normalizeWritingExercisePayload(res.data);
};

export const submitWritingExercise = async (
  payload: WritingSubmitPayload
): Promise<WritingSubmitResponse> => {
  const res = await api.post<WritingSubmitPayloadResponse>("/writing/submit", payload);

  return normalizeWritingSubmitPayload(res.data);
};
