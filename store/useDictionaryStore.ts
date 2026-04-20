import { create } from "zustand";
import { api } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import type { LearningDirection } from "@/types/ProfileData";

export interface DictionaryResult {
  word?: string;
  translation?: string;
  pronunciationHint?: string;
  usageExample?: {
    target?: string;
    native?: string;
  };
  tutorTip?: string;
  [key: string]: unknown;
}

interface DictionaryState {
  isOpen: boolean;
  selectedWord: string | null;
  isLoading: boolean;
  result: DictionaryResult | null;
  error: string | null;
  openDictionary: (word: string, topicId?: string) => Promise<void>;
  closeDictionary: () => void;
}

const resolveLearningDirection = (): LearningDirection => {
  const state = useLanguageStore.getState();
  if (state.learningDirection) return state.learningDirection;

  return state.lang === "am" ? "AM_TO_OR" : "OR_TO_AM";
};

export const useDictionaryStore = create<DictionaryState>((set) => ({
  isOpen: false,
  selectedWord: null,
  isLoading: false,
  result: null,
  error: null,

  openDictionary: async (word, topicId) => {
    if (!word.trim()) return;

    set({
      isOpen: true,
      selectedWord: word,
      isLoading: true,
      result: null,
      error: null,
    });

    try {
      const learningDirection = resolveLearningDirection();

      const response = await api.post<{ data?: DictionaryResult } | DictionaryResult>("/ai/dictionary", {
        text:word,
        topicId,
        learningDirection,
      });

      const payload =
        response.data && typeof response.data === "object" && "data" in response.data
          ? (response.data as { data?: DictionaryResult }).data
          : (response.data as DictionaryResult);

      set({
        result: payload || null,
        isLoading: false,
        error: payload ? null : "No dictionary result returned.",
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Dictionary request failed")
          : error instanceof Error
            ? error.message
            : "Dictionary request failed";

      set({ isLoading: false, error: message, result: null });
    }
  },

  closeDictionary: () => {
    set({
      isOpen: false,
      selectedWord: null,
      isLoading: false,
      result: null,
      error: null,
    });
  },
}));
