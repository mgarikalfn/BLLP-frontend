"use client";

import { Volume2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguageStore } from "@/store/languageStore";
import { useDictionaryStore } from "@/store/useDictionaryStore";

const normalizeResult = (result: Record<string, unknown> | null) => {
  if (!result) {
    return {
      word: "",
      translation: "",
      pronunciationHint: "",
      usageTarget: "",
      usageNative: "",
      tutorTip: "",
    };
  }

  const usageExample =
    typeof result.usageExample === "object" && result.usageExample !== null
      ? (result.usageExample as Record<string, unknown>)
      : {};

  return {
    word: typeof result.word === "string" ? result.word : "",
    translation: typeof result.translation === "string" ? result.translation : "",
    pronunciationHint: typeof result.pronunciationHint === "string" ? result.pronunciationHint : "",
    usageTarget:
      (typeof usageExample.target === "string" ? usageExample.target : "") ||
      (typeof result.exampleTarget === "string" ? result.exampleTarget : ""),
    usageNative:
      (typeof usageExample.native === "string" ? usageExample.native : "") ||
      (typeof result.exampleNative === "string" ? result.exampleNative : ""),
    tutorTip: typeof result.tutorTip === "string" ? result.tutorTip : "",
  };
};

export function DictionaryDrawer() {
  const isOpen = useDictionaryStore((state) => state.isOpen);
  const selectedWord = useDictionaryStore((state) => state.selectedWord);
  const isLoading = useDictionaryStore((state) => state.isLoading);
  const result = useDictionaryStore((state) => state.result as Record<string, unknown> | null);
  const error = useDictionaryStore((state) => state.error);
  const closeDictionary = useDictionaryStore((state) => state.closeDictionary);

  const nativeLanguage = useLanguageStore((state) => state.lang);
  const targetLanguage = useLanguageStore((state) => state.targetLang);

  const uiText = {
    title: nativeLanguage === "am" ? "AI መዝገበ ቃላት" : "Galmee Jechootaa AI",
    subtitle:
      nativeLanguage === "am"
        ? "የቃሉን ትርጉም፣ አጠቃቀም እና አስተማሪ ምክር ይመልከቱ"
        : "Hiika jecha, itti fayyadama fi gorsa barsiisaa ilaali",
    translation: nativeLanguage === "am" ? "ትርጉም" : "Hiika",
    pronunciation: nativeLanguage === "am" ? "የአነባበብ ምክር" : "Gorsa Dubbisa",
    usage: nativeLanguage === "am" ? "የአጠቃቀም ምሳሌ" : "Fakkeenya Itti Fayyadamaa",
    tutorTip: nativeLanguage === "am" ? "የአስተማሪ ምክር" : "Gorsa Barsiisaa",
    loading: nativeLanguage === "am" ? "AI ማብራሪያ በመጫን ላይ..." : "Ibsi AI fe'aa jira...",
    noResult: nativeLanguage === "am" ? "ለዚህ ቃል ውጤት አልተገኘም።" : "Jechichaaf bu'aan hin argamne.",
    speakWord: nativeLanguage === "am" ? "ቃሉን አንብብ" : "Jechicha dubbisi",
  };

  const normalized = normalizeResult(result);

  const speakTargetWord = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const text = normalized.word || selectedWord || "";
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLanguage === "am" ? "am-ET" : "om-ET";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDictionary()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t-2 p-0" showCloseButton>
        <SheetHeader className="border-b bg-[linear-gradient(120deg,#f8fafc_0%,#e0f2fe_45%,#e0e7ff_100%)] px-6 py-5">
          <SheetTitle className="text-xl font-black text-slate-900">{uiText.title}</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-600">{uiText.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-56 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-28 w-full animate-pulse rounded-2xl bg-slate-200" />
              <p className="text-sm font-semibold text-slate-500">{uiText.loading}</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>
          ) : !result ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">{uiText.noResult}</div>
          ) : (
            <>
              <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-black text-slate-900 md:text-4xl">{normalized.word || selectedWord}</h2>
                  <button
                    type="button"
                    onClick={speakTargetWord}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm transition hover:bg-sky-100"
                    aria-label={uiText.speakWord}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{uiText.translation}</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">{normalized.translation}</p>
              </section>

              <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-violet-700">{uiText.pronunciation}</p>
                <p className="mt-1 text-base font-semibold text-violet-900">{normalized.pronunciationHint || "-"}</p>
              </section>

              <section className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-orange-700">{uiText.usage}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{normalized.usageTarget || "-"}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{normalized.usageNative || "-"}</p>
              </section>

              <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-indigo-700">{uiText.tutorTip}</p>
                <p className="mt-1 text-base font-semibold text-indigo-900">{normalized.tutorTip || "-"}</p>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
