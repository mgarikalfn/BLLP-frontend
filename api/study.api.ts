import { api } from "@/lib/api";

export type LearningLanguage = "am" | "ao";

export interface StudyFlashcardItem {
  id: string;
  word: {
    am: string;
    ao: string;
  };
  example?: {
    am?: string;
    ao?: string;
  };
}

interface StudySessionPayload {
  vocabulary?: unknown;
  items?: unknown;
  cards?: unknown;
}

interface StudySessionResponse {
  data?: StudySessionPayload;
  vocabulary?: unknown;
  items?: unknown;
  cards?: unknown;
}

const toLocalized = (value: unknown): { am: string; ao: string } | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as { am?: unknown; ao?: unknown };
  if (typeof record.am !== "string" || typeof record.ao !== "string") return null;

  return { am: record.am, ao: record.ao };
};

const toFlashcardItem = (value: unknown): StudyFlashcardItem | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as {
    _id?: unknown;
    id?: unknown;
    am?: unknown;
    ao?: unknown;
    word?: unknown;
    example?: unknown;
  };

  const id = typeof record._id === "string" ? record._id : typeof record.id === "string" ? record.id : null;
  const word = toLocalized(record.word) || toLocalized({ am: record.am, ao: record.ao });

  if (!id || !word) return null;

  const exampleLocalized =
    record.example && typeof record.example === "object"
      ? (record.example as { am?: unknown; ao?: unknown })
      : undefined;

  const example = exampleLocalized
    ? {
        am: typeof exampleLocalized.am === "string" ? exampleLocalized.am : undefined,
        ao: typeof exampleLocalized.ao === "string" ? exampleLocalized.ao : undefined,
      }
    : undefined;

  return { id, word, example };
};

const getCardsArray = (payload: StudySessionResponse): unknown[] => {
  const direct = payload.vocabulary || payload.cards || payload.items;
  const nested = payload.data?.vocabulary || payload.data?.cards || payload.data?.items;
  const source = nested || direct;

  return Array.isArray(source) ? source : [];
};

export const getStudySession = async (): Promise<StudyFlashcardItem[]> => {
  const res = await api.get<StudySessionResponse>("/study/session");
  const rawCards = getCardsArray(res.data);

  return rawCards.map(toFlashcardItem).filter((item): item is StudyFlashcardItem => item !== null);
};

export interface SubmitStudyReviewPayload {
  vocabId: string;
  quality: 1 | 3 | 4 | 5;
}

export const submitStudyReview = async (payload: SubmitStudyReviewPayload): Promise<void> => {
  await api.post("/study/review", payload);
};
