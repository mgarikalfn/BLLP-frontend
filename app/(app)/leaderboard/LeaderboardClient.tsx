"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeagueHeaderCards } from "@/features/leaderboard/LeagueHeaderCards";
import { LeaderboardList } from "@/features/leaderboard/LeaderboardList";
import { Loader2 } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

const pageText = {
  am: {
    title: "የሊግ መሪዎች",
    subtitle: "በዚህ ሳምንት ማን ከፍ እንደሚያደርግ ይመልከቱ",
    loading: "የመሪዎች ዝርዝር በመጫን ላይ...",
    failed: "የመሪዎች ውሂብ መጫን አልተቻለም",
  },
  ao: {
    title: "Dorgommii Liigii",
    subtitle: "Torban kana eenyu akka ol ka'u ilaali",
    loading: "Dorgommii fe'aa jira...",
    failed: "Odeeffannoo dorgommii fe'uu hin dandeenye",
  },
} as const;

export default function LeaderboardClient() {
  const { data, isLoading, isError } = useLeaderboard();
  const lang = useLanguageStore((state) => state.lang);
  const text = pageText[lang];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-semibold">{text.loading}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-lg font-black text-red-500">{text.failed}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-5 md:px-6">
      <main className="mx-auto w-full max-w-3xl space-y-5">
        <section className="space-y-1 px-1">
          <h1 className="text-3xl font-black text-gray-900">{text.title}</h1>
          <p className="text-sm font-semibold text-gray-500">{text.subtitle}</p>
        </section>

        <LeagueHeaderCards data={data} />
        <LeaderboardList data={data} />
      </main>
    </div>
  );
}
