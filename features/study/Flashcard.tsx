"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { submitStudyReview, type StudyFlashcardItem } from "@/api/study.api";
import { useLanguageStore } from "@/store/languageStore";

type LearningLanguage = "am" | "ao";
type ReviewQuality = 1 | 3 | 4 | 5;

interface FlashcardProps {
  card: StudyFlashcardItem;
  onRated: (cardId: string, quality: ReviewQuality) => void;
}

const ratingConfig: Array<{ quality: ReviewQuality; className: string }> = [
  { quality: 1, className: "bg-rose-500 hover:bg-rose-600" },
  { quality: 3, className: "bg-orange-500 hover:bg-orange-600" },
  { quality: 4, className: "bg-emerald-500 hover:bg-emerald-600" },
  { quality: 5, className: "bg-sky-500 hover:bg-sky-600" },
];

export function Flashcard({ card, onRated }: FlashcardProps) {
  const learningDirection = useLanguageStore((state) => state.learningDirection);
  const storeNative = useLanguageStore((state) => state.lang);
  const storeTarget = useLanguageStore((state) => state.targetLang);

  const nativeLanguage: LearningLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "am"
      : "ao"
    : storeNative;
  const targetLanguage: LearningLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "ao"
      : "am"
    : storeTarget;

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pendingQuality, setPendingQuality] = useState<ReviewQuality | null>(null);

  const reviewMutation = useMutation({
    mutationFn: (quality: ReviewQuality) =>
      submitStudyReview({
        targetId: card.targetId,
        type: "VOCABULARY",
        quality,
      }),
    onSuccess: (_, quality) => {
      setPendingQuality(quality);
      setIsLeaving(true);
    },
    onError: () => {
      setPendingQuality(null);
      setIsLeaving(false);
    },
  });

  const targetWord = card.word[targetLanguage] || card.word.am || card.word.ao;
  const nativeWord = card.word[nativeLanguage] || card.word.am || card.word.ao;
  const nativeExample = card.example?.[nativeLanguage] || card.example?.am || card.example?.ao || "";

  const uiText = useMemo(
    () => ({
      reveal: nativeLanguage === "am" ? "መልሱን አሳይ" : "Deebii mul'isi",
      translation: nativeLanguage === "am" ? "ትርጉም" : "Hiika",
      example: nativeLanguage === "am" ? "ምሳሌ" : "Fakkeenya",
      saving: nativeLanguage === "am" ? "በማስቀመጥ ላይ..." : "Olkaa'aa jira...",
      submitError: nativeLanguage === "am" ? "ውጤቱን ማስቀመጥ አልተቻለም።" : "Bu'aa olkaa'uu hin dandeenye.",
      ratings: {
        1: nativeLanguage === "am" ? "እንደገና / አልተሳካም" : "Ammas / Kufe",
        3: nativeLanguage === "am" ? "ከባድ" : "Ulfaataa",
        4: nativeLanguage === "am" ? "ጥሩ" : "Gaarii",
        5: nativeLanguage === "am" ? "ቀላል" : "Salphaa",
      },
    }),
    [nativeLanguage]
  );

  return (
    <motion.article
      key={card.id}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={isLeaving ? { opacity: 0, x: 80, y: -16, scale: 0.92, rotate: 4 } : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 230, damping: 22 }}
      onAnimationComplete={() => {
        if (isLeaving && pendingQuality) {
          onRated(card.id, pendingQuality);
          setPendingQuality(null);
        }
      }}
      className="w-full"
    >
      <div className="relative h-[420px] [perspective:1200px]">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          <div className="absolute inset-0 flex h-full w-full flex-col rounded-3xl border border-sky-200 bg-[linear-gradient(165deg,#fdfefe_0%,#ecfeff_45%,#e0f2fe_100%)] p-8 shadow-[0_22px_60px_rgba(14,116,144,0.22)] [backface-visibility:hidden]">
            <div className="mb-6 inline-flex w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-sky-700">
              Flashcard
            </div>

            <div className="flex flex-1 items-center justify-center">
              <p className="text-center text-5xl font-black leading-tight text-slate-900 sm:text-6xl">{targetWord}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              disabled={reviewMutation.isPending}
              className="h-12 rounded-2xl border border-sky-300 bg-white text-sm font-black uppercase tracking-wider text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uiText.reveal}
            </button>
          </div>

          <div className="absolute inset-0 flex h-full w-full [transform:rotateY(180deg)] flex-col rounded-3xl border border-violet-200 bg-[linear-gradient(165deg,#ffffff_0%,#f8fafc_46%,#eef2ff_100%)] p-8 shadow-[0_22px_60px_rgba(55,48,163,0.18)] [backface-visibility:hidden]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-500">{uiText.translation}</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{nativeWord}</p>
              </div>

              {nativeExample ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-500">{uiText.example}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-700">{nativeExample}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ratingConfig.map((item) => (
                  <button
                    key={item.quality}
                    type="button"
                    onClick={() => reviewMutation.mutate(item.quality)}
                    disabled={reviewMutation.isPending || isLeaving}
                    className={`${item.className} h-11 rounded-xl px-2 text-xs font-black uppercase tracking-wider text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {uiText.ratings[item.quality]}
                  </button>
                ))}
              </div>

              {reviewMutation.isPending ? (
                <p className="mt-3 text-xs font-semibold text-slate-500">{uiText.saving}</p>
              ) : null}
              {reviewMutation.error ? <p className="mt-3 text-xs font-semibold text-rose-600">{uiText.submitError}</p> : null}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}
