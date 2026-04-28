"use client";

import { useEffect } from "react";
import { Gift } from "lucide-react";
import { useEconomyStore, type DailyQuest } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";
import { getLocalizedTier } from "@/lib/tierTranslations";
import { cn } from "@/lib/utils";

const getTierStyle = (rewardGems: number) => {
  if (rewardGems >= 50) {
    return {
      iconWrap: "bg-yellow-100 text-yellow-600 border-yellow-300",
      progress: "bg-yellow-400",
      claim: "bg-yellow-500 hover:bg-yellow-600 border-yellow-600",
      tier: "Gold",
    };
  }

  if (rewardGems >= 25) {
    return {
      iconWrap: "bg-slate-100 text-slate-500 border-slate-300",
      progress: "bg-slate-500",
      claim: "bg-slate-600 hover:bg-slate-700 border-slate-700",
      tier: "Silver",
    };
  }

  return {
    iconWrap: "bg-amber-100 text-amber-700 border-amber-300",
    progress: "bg-amber-600",
    claim: "bg-amber-600 hover:bg-amber-700 border-amber-700",
    tier: "Bronze",
  };
};

const progressPercent = (quest: DailyQuest) => {
  if (quest.targetValue <= 0) return 0;
  return Math.min(100, Math.round((quest.currentValue / quest.targetValue) * 100));
};

const uiText = {
  am: {
    title: "የዕለቱ ተልዕኮዎች",
    tiers: "ነሃስ • ብር • ወርቅ",
    noQuests: "ምንም ተልዕኮ የለም።",
    gem: "አልማዝ",
    claim: "ውሰድ",
    claimed: "ተወስዷል",
  },
  ao: {
    title: "Gaaffiilee Guyyaa",
    tiers: "Nahaasii • Meetii • Warqee",
    noQuests: "Gaaffiin hin jiru.",
    gem: "Diyamondii",
    claim: "Fudhadhu",
    claimed: "Fudhatameera",
  },
} as const;

export function DailyQuestsList() {
  const lang = useLanguageStore((state) => state.lang);
  const t = uiText[lang];
  
  const dailyQuests = useEconomyStore((state) => state.dailyQuests);
  const isLoading = useEconomyStore((state) => state.isLoading);
  const isClaimingReward = useEconomyStore((state) => state.isClaimingReward);
  const error = useEconomyStore((state) => state.error);
  const fetchEconomyStatus = useEconomyStore((state) => state.fetchEconomyStatus);
  const claimReward = useEconomyStore((state) => state.claimReward);

  useEffect(() => {
    if (dailyQuests.length === 0) {
      void fetchEconomyStatus();
    }
  }, [dailyQuests.length, fetchEconomyStatus]);

  const quests = [...dailyQuests]
    .sort((a, b) => b.rewardGems - a.rewardGems)
    .slice(0, 3);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">{t.title}</h3>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{t.tiers}</span>
      </div>

      {isLoading && quests.length === 0 ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ) : quests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
          {t.noQuests}
        </div>
      ) : (
        <div className="space-y-3">
          {quests.map((quest) => {
            const p = progressPercent(quest);
            const done = p >= 100;
            const tier = getTierStyle(quest.rewardGems);

            return (
               <article key={quest._id} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl border", tier.iconWrap)}>
                    <Gift size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                       {/* Note: quest.description is assumed to be string but can be localized dynamically if updated later */}
                      <p className="truncate text-sm font-black text-slate-800">{quest.description}</p>
                      <span className="shrink-0 text-xs font-black uppercase tracking-wide text-slate-500">
                        {getLocalizedTier(tier.tier, lang)} • +{quest.rewardGems} {t.gem}
                      </span>
                    </div>

                    {done ? (
                      <button
                        type="button"
                        disabled={quest.isClaimed || isClaimingReward}
                        onClick={() => {
                          void claimReward({ type: "QUEST", id: quest._id });
                        }}
                        className={cn(
                          "mt-2 inline-flex h-8 items-center rounded-lg border-b-4 px-4 text-xs font-black uppercase tracking-wider text-white transition",
                          quest.isClaimed
                            ? "cursor-default bg-emerald-500 border-emerald-600"
                            : tier.claim,
                          !quest.isClaimed && "animate-in fade-in duration-300"
                        )}
                      >
                        {quest.isClaimed ? t.claimed : t.claim}
                      </button>
                    ) : (
                      <div className="mt-2">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className={cn("h-full rounded-full transition-all duration-500", tier.progress)} style={{ width: `${p}%` }} />
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {quest.currentValue}/{quest.targetValue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {error ? <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}
    </section>
  );
}
