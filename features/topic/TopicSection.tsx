"use client";

import React, { useState } from "react";
import { WorkspaceTopic } from "@/types/learning";
import { LessonPathContainer } from "./LessonPathContainer";
import { Progress } from "@/components/ui/progress";
import { Shield, BookOpen, Lightbulb, X } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

interface TopicSectionProps {
  topic: WorkspaceTopic;
}

const sectionColors: Record<string, string> = {
  INTRO: "bg-purple-500",
  A1: "bg-sky-500",
  A2: "bg-blue-600",
  B1: "bg-indigo-600",
  B2: "bg-violet-700",
};

export const TopicSection: React.FC<TopicSectionProps> = ({ topic }) => {
  const [showTips, setShowTips] = useState(false);

  // Native lang = the language the learner reads explanations in
  const nativeLang = useLanguageStore((state) => state.lang);
  const fallbackLang = nativeLang === "am" ? "ao" : "am";

  // Level-based banner colour (fallback if no section)
  let levelColor = "bg-slate-500";
  if (topic.level?.toUpperCase() === "BEGINNER") levelColor = "bg-sky-500";
  else if (topic.level?.toUpperCase() === "INTERMEDIATE") levelColor = "bg-indigo-600";
  else if (topic.level?.toUpperCase() === "ADVANCED") levelColor = "bg-violet-700";

  const bannerColor =
    topic.section && sectionColors[topic.section]
      ? sectionColors[topic.section]
      : levelColor;

  const icon =
    topic.level?.toUpperCase() === "ADVANCED" ? (
      <Shield className="w-5 h-5" />
    ) : (
      <BookOpen className="w-5 h-5" />
    );

  const completedCount =
    topic.progress?.completedCount ?? topic.progress?.completedLessons ?? 0;
  const totalCount =
    topic.progress?.totalCount ?? topic.progress?.totalLessons ?? 0;
  const percentage = topic.progress?.percentage ?? 0;

  // Title: show the native-language title, fall back to the other one
  const topicTitle =
    topic.title?.[nativeLang] || topic.title?.[fallbackLang] || "Topic";

  // Tips: only show native language tip
  const tipsText =
    topic.tips?.[nativeLang] || topic.tips?.[fallbackLang] || "";
  const hasTips = Boolean(tipsText);

  // Tips label
  const tipsLabel = nativeLang === "am" ? "ጥቆማዎች" : "Gorsa";
  const noTipsLabel =
    nativeLang === "am"
      ? "ለዚህ ርዕስ ምንም ጥቆማ አልተጨመረም።"
      : "Gorsi kana hin jiru.";
  const grammarTipsLabel =
    nativeLang === "am" ? "የሰዋሰው ጥቆማ" : "Gorsa Seerlugaa";

  return (
    <section className="w-full mb-16 relative">
      {/* ── Sticky topic banner ── */}
      <div className={`sticky top-0 z-50 w-full ${bannerColor} text-white shadow-md`}>
        {/* Top micro-bar: section pill + unit number + tips button */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {topic.section && (
              <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                {topic.section}
              </span>
            )}
            {topic.unitNumber !== undefined && (
              <span className="text-[11px] font-semibold opacity-75">
                Unit {topic.unitNumber}
              </span>
            )}
          </div>
          {hasTips && (
            <button
              type="button"
              onClick={() => setShowTips(true)}
              title={tipsLabel}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 transition rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest"
            >
              <Lightbulb size={13} />
              {tipsLabel}
            </button>
          )}
        </div>

        {/* Main banner row: icon + title + progress */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1 max-w-3xl mx-auto gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="opacity-70">{icon}</div>
            <div className="min-w-0">
              <h2 className="font-black text-lg leading-tight truncate">{topicTitle}</h2>
              <p className="text-[11px] opacity-60 uppercase tracking-widest font-semibold">
                {topic.level}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-28">
            <span className="text-xs font-bold whitespace-nowrap opacity-85">
              {completedCount} / {totalCount} Lessons
            </span>
            <Progress value={percentage} className="w-full h-2 rounded-full bg-white/25" />
          </div>
        </div>
      </div>

      {/* ── Lesson path ── */}
      <div className="pt-10 px-4">
        <LessonPathContainer
          topicId={topic._id}
          pathNodes={topic.pathNodes || []}
          topicTest={topic.topicTest}
          topicTitle={topicTitle}
          isAutoCompleted={topic.isAutoCompleted}
        />
      </div>

      {/* ── Tips Modal — native language only ── */}
      {showTips && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={() => setShowTips(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`${bannerColor} px-5 py-4 flex items-center gap-3 text-white`}>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Lightbulb size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-75">
                  {grammarTipsLabel}
                </p>
                <h3 className="text-base font-black leading-tight truncate">{topicTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTips(false)}
                className="ml-auto shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5">
              {tipsText ? (
                <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                  {tipsText}
                </p>
              ) : (
                <p className="text-sm font-semibold text-slate-400">{noTipsLabel}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};