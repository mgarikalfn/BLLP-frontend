"use client";

import { Gem, Heart, Snowflake } from "lucide-react";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";

const uiText = {
  am: {
    title: "ሱቅ",
    subtitle: "አልማዝዎን ይጠቀሙበት",
    items: {
      refill: { title: "ልብ ሙላ", subtitle: "ሁሉንም ልቦች ይመልሱ" },
      freeze: { title: "የተከታታይ ቀን ማስጠበቂያ", subtitle: "ተከታታይ ቀኖት እንዳይቋረጥ ይጠብቁ" },
      avatar: { title: "ልዩ ምስል", subtitle: "አዲስ ፕሮፋይል ይክፈቱ" },
    },
    buy: "ግዛ",
    full: "ሙሉ",
    comingSoon: "በቅርቡ ይደርሳል",
  },
  ao: {
    title: "Suuqii",
    subtitle: "Diyamondii keessan itti fayyadamaa",
    items: {
      refill: { title: "Onnee Guuti", subtitle: "Onnee hunda battalatti deebisi" },
      freeze: { title: "Guyyaa Walitti Aanu Eegi", subtitle: "Dhuma guyyaa irraa eegi" },
      avatar: { title: "Suuraa Addaa", subtitle: "Profaayilii haaraa bani" },
    },
    buy: "Biti",
    full: "Guutuu",
    comingSoon: "Dhiheenyatti",
  },
} as const;

export default function ShopPage() {
  const lang = useLanguageStore((state) => state.lang);
  const t = uiText[lang];
  
  const hearts = useEconomyStore((state) => state.hearts);
  const gems = useEconomyStore((state) => state.gems);
  const streakFreezeActive = useEconomyStore((state) => state.streakFreezeActive);
  const refillHearts = useEconomyStore((state) => state.refillHeartsWithGems);
  const buyStreakFreeze = useEconomyStore((state) => state.buyStreakFreeze);

  const canBuyHearts = hearts < 5 && gems >= 500;
  const canBuyFreeze = gems >= 200;
  const isHeartsFull = hearts >= 5;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-5 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t.title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{t.subtitle}</p>
        </div>
        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
          <Gem size={32} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Heart Refill */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
              <Heart size={28} />
            </span>
            <div>
              <p className="text-lg font-black text-slate-900">{t.items.refill.title}</p>
              <p className="text-sm font-medium text-slate-500">{t.items.refill.subtitle}</p>
            </div>
          </div>
          
          <button
            onClick={() => void refillHearts()}
            disabled={!canBuyHearts}
            className={`flex flex-col items-center justify-center rounded-xl border-b-4 px-6 py-2 transition-all ${
              isHeartsFull
                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                : canBuyHearts
                ? "bg-sky-500 border-sky-700 text-white hover:bg-sky-400 active:border-b-0 active:translate-y-1"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span className="text-sm font-black uppercase tracking-wider">
              {isHeartsFull ? t.full : t.buy}
            </span>
            {!isHeartsFull && (
              <span className="flex items-center gap-1 text-xs font-bold">
                <Gem size={12} /> 500
              </span>
            )}
          </button>
        </div>

        {/* Streak Freeze */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 relative">
              <Snowflake size={28} />
              {streakFreezeActive > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-black text-white">
                  {streakFreezeActive}
                </span>
              )}
            </span>
            <div>
              <p className="text-lg font-black text-slate-900">{t.items.freeze.title}</p>
              <p className="text-sm font-medium text-slate-500">{t.items.freeze.subtitle}</p>
            </div>
          </div>
          
          <button
            onClick={() => void buyStreakFreeze()}
            disabled={!canBuyFreeze}
            className={`flex flex-col items-center justify-center rounded-xl border-b-4 px-6 py-2 transition-all ${
              canBuyFreeze
                ? "bg-sky-500 border-sky-700 text-white hover:bg-sky-400 active:border-b-0 active:translate-y-1"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span className="text-sm font-black uppercase tracking-wider">
              {t.buy}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold">
              <Gem size={12} /> 200
            </span>
          </button>
        </div>

        {/* Premium Avatar (Coming Soon) */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm opacity-70">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
              <Gem size={28} />
            </span>
            <div>
              <p className="text-lg font-black text-slate-900">{t.items.avatar.title}</p>
              <p className="text-sm font-medium text-slate-500">{t.items.avatar.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-xl bg-slate-200 px-4 py-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t.comingSoon}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
