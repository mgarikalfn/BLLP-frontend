"use client";

import { useCallback } from "react";
import { Flame, Star, BookOpen, Mic, PenLine, Shield, Trophy, Zap } from "lucide-react";
import { useEconomyStore, type Achievement } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/lib/utils";

// ─── i18n ─────────────────────────────────────────────────────────────────────

const uiText = {
  am: {
    title: "የሕይወት ዘመን ሜዳሊያዎች",
    subtitle: "የእርስዎ ስኬቶች ታሪክ",
    noAchievements: "ምንም ስኬት ገና አልተገኘም።",
    gem: "አልማዝ",
    claim: "ሽልማቱን ውሰድ",
    claimed: "ተወስዷል ✓",
    level: "ደረጃ",
    progress: "ሂደት",
    maxed: "ሁሉም ደረጃዎች ተጠናቀዋል!",
  },
  ao: {
    title: "Badhaasa Jireenyaa",
    subtitle: "Seenaa milkaa'ina keessan",
    noAchievements: "Milkaa'inni hin jiru ammaaf.",
    gem: "Diyamondii",
    claim: "Mindaa Fudhachuu",
    claimed: "Fudhatameera ✓",
    level: "Sadarkaa",
    progress: "Deemumsaa",
    maxed: "Sadarkaaleen hundi guutame!",
  },
} as const;

// ─── Achievement Icon Map ─────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  STREAK: Flame,
  TOTAL_XP: Star,
  XP: Star,
  LESSONS: BookOpen,
  SPEAKING: Mic,
  WRITING: PenLine,
  QUESTS: Shield,
  TOPICS: Zap,
};

// ─── Tier Colors per level ────────────────────────────────────────────────────

const LEVEL_STYLES = [
  // Level 1 — Bronze
  {
    ring: "ring-amber-400",
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
    bar: "from-amber-400 to-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    glow: "shadow-amber-200",
  },
  // Level 2 — Silver
  {
    ring: "ring-slate-400",
    iconBg: "bg-slate-100 text-slate-600 border-slate-200",
    bar: "from-slate-400 to-slate-500",
    badge: "bg-slate-100 text-slate-600 border-slate-300",
    glow: "shadow-slate-200",
  },
  // Level 3 — Gold
  {
    ring: "ring-yellow-400",
    iconBg: "bg-yellow-50 text-yellow-600 border-yellow-200",
    bar: "from-yellow-400 to-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
    glow: "shadow-yellow-200",
  },
  // Level 4+ — Diamond/Purple
  {
    ring: "ring-violet-500",
    iconBg: "bg-violet-50 text-violet-600 border-violet-200",
    bar: "from-violet-500 to-indigo-500",
    badge: "bg-violet-100 text-violet-700 border-violet-300",
    glow: "shadow-violet-200",
  },
];

const getLevelStyle = (level: number) => LEVEL_STYLES[Math.min(level - 1, LEVEL_STYLES.length - 1)];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AchievementCard({
  achievement,
  t,
  isClaimingReward,
  onClaim,
}: {
  achievement: Achievement;
  t: (typeof uiText)["am"];
  isClaimingReward: boolean;
  onClaim: () => void;
}) {
  const isDone = achievement.currentProgress >= achievement.targetValue;
  const isMaxed = achievement.isClaimed && achievement.currentProgress >= achievement.targetValue;
  const p =
    achievement.targetValue > 0
      ? Math.min(100, Math.round((achievement.currentProgress / achievement.targetValue) * 100))
      : 0;

  const style = getLevelStyle(achievement.level ?? 1);
  const Icon = ICON_MAP[achievement.type] ?? Trophy;
  const levelStr = `${t.level} ${achievement.level ?? 1}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        style.glow,
        "shadow-md",
        achievement.isClaimed && "opacity-80"
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 ring-2 ring-offset-2 transition-transform duration-300 group-hover:scale-110",
            style.iconBg,
            style.ring
          )}
        >
          <Icon size={26} />
          {/* Glow pulse when claimable */}
          {isDone && !achievement.isClaimed && (
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-30 bg-current" />
          )}
        </div>

        {/* Title + level badge */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-black text-slate-900">{achievement.title}</h4>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                style.badge
              )}
            >
              {levelStr}
            </span>
          </div>

          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            +{achievement.rewardGems} {t.gem}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{t.progress}</span>
          <span>
            {achievement.currentProgress.toLocaleString()} / {achievement.targetValue.toLocaleString()}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", style.bar)}
            style={{ width: `${p}%` }}
          />
        </div>

        {/* Completion percentage */}
        <p className="text-right text-[10px] font-bold text-slate-400">{p}%</p>
      </div>

      {/* CTA area */}
      {isDone && !achievement.isClaimed ? (
        <button
          type="button"
          disabled={isClaimingReward}
          onClick={onClaim}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border-b-4 px-4 py-2.5",
            "text-sm font-black uppercase tracking-wider text-white",
            "bg-violet-600 border-violet-800 hover:bg-violet-500 active:border-b-0",
            "transition-all duration-200 animate-in fade-in zoom-in-95",
            isClaimingReward && "opacity-60 cursor-not-allowed"
          )}
        >
          <Trophy size={15} />
          {t.claim}
        </button>
      ) : achievement.isClaimed ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-emerald-600 border border-emerald-200">
          {t.claimed}
        </div>
      ) : null}
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AchievementsList() {
  const lang = useLanguageStore((state) => state.lang);
  const t = uiText[lang];

  const achievements = useEconomyStore((state) => state.achievements);
  const isClaimingReward = useEconomyStore((state) => state.isClaimingReward);
  const claimReward = useEconomyStore((state) => state.claimReward);

  const handleClaim = useCallback(
    (id: string) => {
      void claimReward({ type: "ACHIEVEMENT", id });
    },
    [claimReward]
  );

  return (
    <section className="mt-8 space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">{t.title}</h3>
          <p className="text-xs font-semibold text-slate-500">{t.subtitle}</p>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <Trophy size={40} className="text-slate-300" />
          <p className="text-sm font-bold text-slate-500">{t.noAchievements}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement._id}
              achievement={achievement}
              t={t}
              isClaimingReward={isClaimingReward}
              onClaim={() => handleClaim(achievement._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
