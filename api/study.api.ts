import { api } from "@/lib/api";

export type LearningLanguage = "am" | "ao";

export interface StudyFlashcardItem {
  id: string;
  targetId: string;
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
  flashcards?: unknown;
  vocabulary?: unknown;
  items?: unknown;
  cards?: unknown;
  lessons?: unknown;
}

interface StudySessionResponse {
  success?: boolean;
  message?: string;
  data?: StudySessionPayload;
  flashcards?: unknown;
  vocabulary?: unknown;
  items?: unknown;
  cards?: unknown;
  lessons?: unknown;
}

const toLocalized = (value: unknown): { am: string; ao: string } | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as { am?: unknown; ao?: unknown };
  if (typeof record.am !== "string" || typeof record.ao !== "string") return null;

  return { am: record.am, ao: record.ao };
};

const toFlashcardItem = (value: unknown, index: number): StudyFlashcardItem | null => {
  if (!value || typeof value !== "object") return null;

  const record = value as {
    _id?: unknown;
    id?: unknown;
    vocabId?: unknown;
    vocabularyId?: unknown;
    am?: unknown;
    ao?: unknown;
    text?: unknown;
    translation?: unknown;
    word?: unknown;
    content?: unknown;
    example?: unknown;
    exampleSentence?: unknown;
  };

  const targetId =
    typeof record._id === "string"
      ? record._id
      : typeof record.id === "string"
        ? record.id
        : typeof record.vocabId === "string"
          ? record.vocabId
          : typeof record.vocabularyId === "string"
            ? record.vocabularyId
            : `study-card-${index}`;

  const id = targetId;

  const word =
    toLocalized(record.word) ||
    toLocalized(record.content) ||
    toLocalized({ am: record.am, ao: record.ao }) ||
    toLocalized({ am: record.text, ao: record.translation });

  if (!word) return null;

  const exampleLocalized =
    (record.example && typeof record.example === "object"
      ? (record.example as { am?: unknown; ao?: unknown })
      : null) ||
    (record.exampleSentence && typeof record.exampleSentence === "object"
      ? (record.exampleSentence as { am?: unknown; ao?: unknown })
      : undefined);

  const example = exampleLocalized
    ? {
        am: typeof exampleLocalized.am === "string" ? exampleLocalized.am : undefined,
        ao: typeof exampleLocalized.ao === "string" ? exampleLocalized.ao : undefined,
      }
    : undefined;

  return { id, targetId, word, example };
};

const getCardsArray = (payload: StudySessionResponse): unknown[] => {
  const deepNested =
    payload.data && typeof payload.data === "object" && "data" in payload.data
      ? (payload.data as { data?: StudySessionPayload }).data
      : undefined;

  const direct = payload.vocabulary || payload.cards || payload.items || payload.lessons;
  const nested =
    payload.data?.flashcards ||
    payload.data?.vocabulary ||
    payload.data?.cards ||
    payload.data?.items ||
    payload.data?.lessons;
  const nestedInData =
    deepNested?.flashcards ||
    deepNested?.vocabulary ||
    deepNested?.cards ||
    deepNested?.items ||
    deepNested?.lessons;
  const directWithFlashcards = payload.flashcards || direct;
  const source = nestedInData || nested || directWithFlashcards;

  return Array.isArray(source) ? source : [];
};

export const getStudySession = async (): Promise<StudyFlashcardItem[]> => {
  const res = await api.get<StudySessionResponse>("/study/session");
  const rawCards = getCardsArray(res.data);

  return rawCards
    .map((item, index) => toFlashcardItem(item, index))
    .filter((item): item is StudyFlashcardItem => item !== null);
};

export interface SubmitStudyReviewPayload {
  targetId: string;
  type: "VOCABULARY";
  quality: 1 | 3 | 4 | 5;
}

export interface SubmitStudyReviewResponse {
  message: string;
  targetId: string;
  type: "VOCABULARY";
  nextReview: string;
  streak: number;
  todayCount: number;
  dailyGoal: number;
  xpEarned: number;
  totalXP: number;
  level: number;
  leveledUp: boolean;
}

export const submitStudyReview = async (payload: SubmitStudyReviewPayload): Promise<SubmitStudyReviewResponse> => {
  const res = await api.post<SubmitStudyReviewResponse>("/study/review", payload);
  return res.data;
};
