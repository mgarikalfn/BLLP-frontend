"use client";

import React, { useState } from "react";
import { WorkspaceTopic } from "@/types/learning";
import { LessonPathContainer } from "./LessonPathContainer";
import { Progress } from "@/components/ui/progress";
import { Shield, BookOpen } from "lucide-react";

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

  // Level-based color (fallback if no section)
  let levelColor = "bg-slate-500";
  if (topic.level?.toUpperCase() === "BEGINNER") levelColor = "bg-sky-500";
  else if (topic.level?.toUpperCase() === "INTERMEDIATE") levelColor = "bg-indigo-600";
  else if (topic.level?.toUpperCase() === "ADVANCED") levelColor = "bg-violet-700";

  // Section color takes priority
  const bannerColor = topic.section && sectionColors[topic.section]
    ? sectionColors[topic.section]
    : levelColor;

  const icon = topic.level?.toUpperCase() === "ADVANCED"
    ? <Shield className="w-5 h-5" />
    : <BookOpen className="w-5 h-5" />;

  const completedCount = topic.progress?.completedCount ?? topic.progress?.completedLessons ?? 0;
  const totalCount = topic.progress?.totalCount ?? topic.progress?.totalLessons ?? 0;
  const percentage = topic.progress?.percentage ?? 0;
  const amharicTitle = topic.title?.am || "Topic";
  const oromoTitle = topic.title?.ao || "";
  const hasTips = Boolean(topic.tips?.am || topic.tips?.ao);

  return (
    <section className="w-full mb-16 relative">
      {/* Sticky topic banner */}
      <div
        className={`sticky top-0 z-50 w-full ${bannerColor} text-white shadow-md`}
      >
        {/* Top bar: section badge + unit number + tips button */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {topic.section && (
              <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                {topic.section}
              </span>
            )}
            {topic.unitNumber !== undefined && (
              <span className="text-xs font-semibold opacity-80">
                Unit {topic.unitNumber}
              </span>
            )}
          </div>
          {hasTips && (
            <button
              type="button"
              onClick={() => setShowTips(true)}
              title="View Grammar Tips"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest"
            >
              💡 Tips
            </button>
          )}
        </div>

        {/* Main banner: icon + bilingual title + progress */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1 max-w-3xl mx-auto gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="opacity-80">{icon}</div>
            <div className="min-w-0">
              <h2 className="font-black text-lg leading-tight truncate">
                {amharicTitle}
                {oromoTitle && oromoTitle !== amharicTitle && (
                  <span className="opacity-60 font-semibold ml-2">| {oromoTitle}</span>
                )}
              </h2>
              <p className="text-xs opacity-70 uppercase tracking-widest font-semibold">
                {topic.level}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-28">
            <span className="text-xs font-bold whitespace-nowrap opacity-90">
              {completedCount} / {totalCount} Lessons
            </span>
            <Progress value={percentage} className="w-full h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Lesson path below the banner */}
      <div className="pt-10 px-4">
        <LessonPathContainer
          topicId={topic._id}
          pathNodes={topic.pathNodes || []}
          topicTest={topic.topicTest}
          topicTitle={amharicTitle}
        />
      </div>

      {/* Tips Modal */}
      {showTips && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center px-4"
          onClick={() => setShowTips(false)}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowTips(false)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-500 hover:bg-slate-50"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              💡 Tips — {amharicTitle}
            </h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Grammar & Vocabulary Tips
            </p>
            <div className="space-y-3">
              {topic.tips?.am && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Amharic (አማርኛ)
                  </p>
                  <p className="whitespace-pre-line text-sm font-semibold text-slate-700 leading-relaxed">
                    {topic.tips.am}
                  </p>
                </div>
              )}
              {topic.tips?.ao && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Afan Oromo (Oromoo)
                  </p>
                  <p className="whitespace-pre-line text-sm font-semibold text-slate-700 leading-relaxed">
                    {topic.tips.ao}
                  </p>
                </div>
              )}
              {!topic.tips?.am && !topic.tips?.ao && (
                <p className="text-sm font-semibold text-slate-400">
                  No tips added yet for this topic.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};