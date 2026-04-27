"use client";

import { Trophy } from "lucide-react";
import { DailyQuestsList } from "@/features/quests/DailyQuestsList";
import { AchievementsList } from "@/features/quests/AchievementsList";
import { useLanguageStore } from "@/store/languageStore";

const uiText = {
  am: {
    title: "ተልዕኮዎች እና ባጆች",
    subtitle: "ዕለታዊ ተግባራትን ያጠናቅቁ እና የዕድሜ ልክ ስኬቶችን ያግኙ!",
  },
  ao: {
    title: "Gaaffiilee fi Baajota",
    subtitle: "Hojii guyyaa guyyaa xumuriitii milkaa'ina jireenya guutuu argadhu!",
  },
} as const;

export default function QuestsPage() {
  const lang = useLanguageStore((state) => state.lang);
  const t = uiText[lang];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t.title}</h1>
          <p className="text-sm font-medium text-slate-600">
            {t.subtitle}
          </p>
        </div>
      </div>

      <DailyQuestsList />
      <AchievementsList />
    </section>
  );
}
