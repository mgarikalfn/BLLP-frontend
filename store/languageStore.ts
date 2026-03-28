import { create } from "zustand";
import type { Language } from "@/lib/translations";

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "am",
  setLang: (lang) => set({ lang }),
  toggleLang: () =>
    set((state) => ({
      lang: state.lang === "am" ? "ao" : "am",
    })),
}));
