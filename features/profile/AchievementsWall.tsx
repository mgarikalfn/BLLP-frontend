"use client";

import { useEffect, useMemo } from "react";
import { Gem } from "lucide-react";
import { BadgeComponent } from "@/components/ui/BadgeComponent";
import { cn } from "@/lib/utils";
import { useEconomyStore, type Achievement } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";

const wallText = {
  am: {
    title: "የስኬት ግድግዳ",
    lifetime: "በህይወት ዘመን",
    progress: "ቀጣዩን ደረጃ ለመክፈት እድገት",
    achievement: "ስኬት",
    lv: "ደረጃ",
    claim: "ሽልማት ይጠይቁ",
    achievements: {
      STREAK: { title: "ሰደድ እሳት", description: "የ30-ቀን ተከታታይ ደረጃ ላይ መድረስ" },
      TOTAL_XP: { title: "ምሁሩ", description: "በጣም ብዙ አጠቃላይ XP ያግኙ" },
      XP: { title: "የXP ጌታ", description: "የXP ትርፍ ደረጃዎችን መሰብሰብዎን ይቀጥሉ" },
      TOPICS: { title: "የርዕስ ታይታን", description: "የርዕስ ትርፍ ደረጃዎችን ያጠናቅቁ" }
    }
  },
  ao: {
    title: "Gidaara Milkaa'inaa",
    lifetime: "Jireenya guutuu",
    progress: "Sadarkaa itti aanu banuuf qarqara",
    achievement: "Milkaa'ina",
    lv: "Sadarkaa",
    claim: "Badhaasa gaafadhu",
    achievements: {
      STREAK: { title: "Ibidda bosonaa", description: "Sadarkaa guyyoota 30 ga'i" },
      TOTAL_XP: { title: "Hayyuu", description: "XP walii galaa guddaa argadhu" },
      XP: { title: "Goota XP", description: "Milkoomina XP walitti qabuu itti fufi" },
      TOPICS: { title: "Mata duree Titan", description: "Milkoomina mata duree xumuri" }
    }
  }
};

const majorConfigs: Record<string, { uiType: "STREAK" | "XP" | "TOPICS" }> = {
  STREAK: {
    uiType: "STREAK",
  },
  TOTAL_XP: {
    uiType: "XP",
  },
  XP: {
    uiType: "XP",
  },
  TOPICS: {
    uiType: "TOPICS",
  },
};

const progressPercent = (item: Achievement) => {
  if (item.targetValue <= 0) return 0;
  return Math.min(100, Math.round((item.currentProgress / item.targetValue) * 100));
};

const toUiLevel = (level: number): 1 | 2 | 3 | 4 => {
  if (level >= 4) return 4;
  if (level <= 1) return 1;
  return level as 1 | 2 | 3;
};

export function AchievementsWall() {
  const lang = useLanguageStore((state) => state.lang);
  const t = wallText[lang as keyof typeof wallText] || wallText.am;

  const achievements = useEconomyStore((state) => state.achievements);
  const isLoading = useEconomyStore((state) => state.isLoading);
  const isClaimingReward = useEconomyStore((state) => state.isClaimingReward);
  const error = useEconomyStore((state) => state.error);
  const fetchEconomyStatus = useEconomyStore((state) => state.fetchEconomyStatus);
  const claimReward = useEconomyStore((state) => state.claimReward);

  useEffect(() => {
    if (achievements.length === 0) {
      void fetchEconomyStatus();
    }
  }, [achievements.length, fetchEconomyStatus]);

  const wallItems = useMemo(() => {
    if (achievements.length > 0) {
      return achievements.slice(0, 5);
    }

    return [
      {
        _id: "placeholder-streak",
        title: "Wildfire",
        type: "STREAK",
        currentProgress: 0,
        targetValue: 30,
        level: 1,
        rewardGems: 500,
        isClaimed: true,
      },
      {
        _id: "placeholder-xp",
        title: "The Scholar",
        type: "TOTAL_XP",
        currentProgress: 0,
        targetValue: 2000,
        level: 1,
        rewardGems: 500,
        isClaimed: true,
      },
      {
        _id: "placeholder-topics",
        title: "Topic Titan",
        type: "TOPICS",
        currentProgress: 0,
        targetValue: 10,
        level: 1,
        rewardGems: 500,
        isClaimed: true,
      },
    ] as Achievement[];
  }, [achievements]);

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{t.title}</h2>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{t.lifetime}</span>
      </div>

      {isLoading && achievements.length === 0 ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ) : (
        <div className="space-y-3">
          {wallItems.map((item) => {
            const config = majorConfigs[item.type] || { uiType: "XP" as const };
            const textConfig = t.achievements[item.type as keyof typeof t.achievements] || {
              title: item.title || t.achievement,
              description: t.progress
            };

            const p = progressPercent(item);
            const claimable = item.currentProgress >= item.targetValue && !item.isClaimed;

            return (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-start gap-3">
                  <BadgeComponent
                    type={config.uiType}
                    level={toUiLevel(item.level)}
                    isUnlocked={item.currentProgress > 0 || claimable || item.isClaimed}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{textConfig.title}</h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">{textConfig.description}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        {t.lv} {item.level}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className={cn("h-full rounded-full transition-all duration-500", p >= 100 ? "bg-emerald-500" : "bg-sky-500")} style={{ width: `${p}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {item.currentProgress}/{item.targetValue}
                      </p>
                    </div>

                    {claimable ? (
                      <button
                        type="button"
                        onClick={() => {
                          void claimReward({ type: "ACHIEVEMENT", id: item._id });
                        }}
                        disabled={isClaimingReward}
                        className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border-b-4 border-yellow-600 bg-yellow-500 px-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-yellow-600"
                      >
                        <Gem size={14} />
                        {t.claim} (+{item.rewardGems} 💎)
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
    </section>
  );
}
