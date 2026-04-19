import { create } from "zustand";
import type { Language } from "@/lib/translations";
import type { LearningDirection } from "@/types/ProfileData";

interface LanguageState {
  // Native/UI language for labels and system text.
  lang: Language;
  // Target learning language for primary lesson content.
  targetLang: Language;
  learningDirection: LearningDirection | null;
  setLang: (lang: Language) => void;
  setLearningDirection: (direction: LearningDirection) => void;
  initializeFromProfile: (direction: LearningDirection) => void;
  toggleLang: () => void;
}

const getLanguagesFromDirection = (direction: LearningDirection): { native: Language; target: Language } => {
  if (direction === "AM_TO_OR") {
    return { native: "am", target: "ao" };
  }

  return { native: "ao", target: "am" };
};

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "am",
  targetLang: "ao",
  learningDirection: null,
  setLang: (lang) => set({ lang }),
  setLearningDirection: (learningDirection) => {
    const { native, target } = getLanguagesFromDirection(learningDirection);
    set({ learningDirection, lang: native, targetLang: target });
  },
  initializeFromProfile: (learningDirection) => {
    const { native, target } = getLanguagesFromDirection(learningDirection);
    set({ learningDirection, lang: native, targetLang: target });
  },
  toggleLang: () =>
    set((state) => ({
      lang: state.lang === "am" ? "ao" : "am",
    })),
}));
