import { api } from "@/lib/api";

type StartCertificationResponse = {
  attemptId?: string;
  id?: string;
  questions?: unknown[];
  durationSeconds?: number;
  timeLimitSeconds?: number;
  timeLimit?: number;
};

type SubmitCertificationResponse = {
  passed?: boolean;
  certificateId?: string;
  certificate?: { _id?: string; id?: string };
  message?: string;
};

export const startCertification = async (level: string): Promise<StartCertificationResponse> => {
  const res = await api.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/study/certifications/start`, { level: level.toUpperCase() });
  return "data" in res.data ? res.data.data : res.data;
};

export const submitCertification = async (
  attemptId: string,
  payload: unknown
): Promise<SubmitCertificationResponse> => {
  const res = await api.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/study/certifications/${attemptId}/submit`, payload);
  return "data" in res.data ? res.data.data : res.data;
};
