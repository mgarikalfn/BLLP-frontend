import { useEffect, useMemo, useState } from "react";
import { Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardData } from "@/types/LeaderboardData";
import { useLanguageStore } from "@/store/languageStore";import { getLocalizedTier } from "@/lib/tierTranslations";
const headerText = {
  am: {
    currentLeague: "የአሁኑ ምድብ",
    yourRank: "የእርስዎ ደረጃ",
    endsIn: "ይዘጋል በ",
    inPromotion: "በማሻሻያ ዞን ውስጥ",
    inDemotion: "በመውረድ ዞን ውስጥ",
    safe: "ደህንነት ዞን",
    league: "ምድብ",
  },
  ao: {
    currentLeague: "GAREE AMMA",
    yourRank: "SADARKAA KEE",
    endsIn: "Ni xumurama",
    inPromotion: "NAANNOO OLGUDDINA KEESSA JIRTA",
    inDemotion: "NAANNOO GAD-BU'AA KEESSA JIRTA",
    safe: "NAANNOO NAGEENYAA",
    league: "GAREE",
  },
} as const;

const getTimeLeft = (targetTime?: string, nowMs: number = Date.now()) => {
  if (!targetTime) {
    return "03d 14h 22m";
  }

  const diff = new Date(targetTime).getTime() - nowMs;
  if (diff <= 0) {
    return "00d 00h 00m";
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
};

export function LeagueHeaderCards({ data }: { data: LeaderboardData }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = headerText[lang];
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    return getTimeLeft(data.seasonEndTime, now);
  }, [data.seasonEndTime, now]);

  const zoneLabel = useMemo(() => {
    if (data.currentUser.zone === "PROMOTION") return text.inPromotion;
    if (data.currentUser.zone === "DEMOTION") return text.inDemotion;
    return text.safe;
  }, [data.currentUser.zone, text]);

  const zoneColor =
    data.currentUser.zone === "PROMOTION"
      ? "text-emerald-600"
      : data.currentUser.zone === "DEMOTION"
        ? "text-red-600"
        : "text-gray-500";

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <article className="rounded-3xl border-b-8 border-amber-300 bg-gradient-to-br from-white to-amber-50 p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{text.currentLeague}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {getLocalizedTier(data.pagination.tier, lang)} {text.league}
            </h2>
            <p className="mt-1 text-sm font-bold text-gray-600">
              {text.endsIn} {countdown}
            </p>
          </div>
          <div className="rounded-2xl border-b-4 border-amber-500 bg-amber-400 p-3 text-white">
            <Trophy size={34} />
          </div>
        </div>
      </article>

      <article className="rounded-3xl border-b-8 border-emerald-300 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">{text.yourRank}</p>
            <h2 className="mt-2 text-5xl font-black text-gray-900">#{data.currentUser.rank}</h2>
            <p className={cn("mt-2 text-sm font-black uppercase tracking-wide", zoneColor)}>{zoneLabel}</p>
          </div>
          <div className="rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 p-3 text-white">
            <TrendingUp size={30} />
          </div>
        </div>
      </article>
    </section>
  );
}
