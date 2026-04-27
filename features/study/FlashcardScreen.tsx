"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { getStudySession, type StudyFlashcardItem } from "@/api/study.api";
import { useLanguageStore } from "@/store/languageStore";
import { useEconomyStore } from "@/store/useEconomyStore";
import { Flashcard } from "./Flashcard";

type ReviewQuality = 1 | 3 | 4 | 5;

export function FlashcardScreen() {
  const nativeLanguage = useLanguageStore((state) => state.lang);
  const earnHeart = useEconomyStore((state) => state.earnHeart);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [hasEarnedHeart, setHasEarnedHeart] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["study", "session"],
    queryFn: getStudySession,
  });

  const queue = useMemo(() => {
    const allCards = sessionQuery.data ?? [];
    if (reviewedIds.length === 0) return allCards;
    return allCards.filter((card: StudyFlashcardItem) => !reviewedIds.includes(card.id));
  }, [sessionQuery.data, reviewedIds]);

  const text = useMemo(
    () => ({
      title: nativeLanguage === "am" ? "የፍላሽ ካርድ ልምምድ" : "Shaakala Flashcard",
      subtitle:
        nativeLanguage === "am"
          ? "ቃላትን አስታውሱ፣ ደረጃ ይስጡ እና ሁሉንም በቀላሉ ይጨርሱ"
          : "Jechoota yaadadhu, sadarkaa kenni, saffisaan xumuri",
      loading: nativeLanguage === "am" ? "የጥናት ክፍለ ጊዜ በመጫን ላይ..." : "Kutaa qo'annoo fe'aa jira...",
      failed: nativeLanguage === "am" ? "የፍላሽ ካርዶችን መጫን አልተቻለም።" : "Flashcards fe'uu hin dandeenye.",
      retry: nativeLanguage === "am" ? "እንደገና ሞክር" : "Irra deebi'ii yaali",
      doneTitle: nativeLanguage === "am" ? "ዛሬ ሁሉንም ጨርሰዋል" : "Har'a hunda xumurte",
      doneSubtitle: nativeLanguage === "am" ? "በጣም ጥሩ፣ የጥናት ክምችትዎ ባዶ ነው።" : "Baay'ee gaarii, kuusaan qo'annoo kee duwwaa dha.",
    }),
    [nativeLanguage]
  );

  const totalCount = sessionQuery.data?.length ?? queue.length;
  const completedCount = Math.max(0, totalCount - queue.length);
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  useEffect(() => {
    if (queue.length === 0 && reviewedIds.length > 0 && !hasEarnedHeart) {
      setHasEarnedHeart(true);
      void earnHeart();
    }
  }, [queue.length, reviewedIds.length, hasEarnedHeart, earnHeart]);

  const handleRated = (cardId: string, quality: ReviewQuality) => {
    void quality;
    setReviewedIds((prev) => {
      if (prev.includes(cardId)) return prev;
      return [...prev, cardId];
    });
  };

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-md">
          <Loader2 className="animate-spin text-sky-600" size={18} />
          <p className="font-semibold text-slate-600">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-lg font-black text-rose-700">{text.failed}</p>
          <button
            type="button"
            onClick={() => {
              void sessionQuery.refetch();
            }}
            className="mx-auto mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-black uppercase tracking-wider text-white hover:bg-rose-700"
          >
            <RefreshCw size={16} />
            {text.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:py-10">
      <div className="mb-6 space-y-3">
        <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{text.title}</h1>
        <p className="text-sm font-medium text-slate-600 md:text-base">{text.subtitle}</p>

        <div className="overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_55%,#4f46e5_100%)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    {queue.length > 0 ? (
        <Flashcard key={queue[0].id} card={queue[0]} onRated={handleRated} />
      ) : (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="text-2xl font-black text-emerald-700">{text.doneTitle}</h2>
          <p className="mt-2 font-medium text-emerald-800">{text.doneSubtitle}</p>
          
          <div className="mt-8 flex justify-center">
            <a 
              href="/dashboard" 
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-8 text-base font-black text-white border-b-4 border-emerald-800 hover:bg-emerald-700 active:border-b-0"
            >
              {nativeLanguage === "am" ? "ወደ ዋና ገጽ ተመለስ" : "Gara Fuula Duraatti Deebi'i"}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
