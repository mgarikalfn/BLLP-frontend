import { LeaderboardData } from "@/types/LeaderboardData";
import { LeaderboardRow } from "./LeaderboardRow";
import { useLanguageStore } from "@/store/languageStore";

const listText = {
  am: {
    promoZone: "የማሻሻያ ዞን",
    topAdvance: "TOP 10 ወደ ላይ ይወጣሉ",
  },
  ao: {
    promoZone: "NAANNOO OLGUDDINA",
    topAdvance: "TOP 10 SADARKAA OLU",
  },
} as const;

export function LeaderboardList({ data }: { data: LeaderboardData }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = listText[lang];

  const page = data.pagination.page || 1;
  const pageSize = data.leaderboard.length || 1;
  const rankOffset = (page - 1) * pageSize;

  return (
    <section className="space-y-3 rounded-3xl border-2 border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-xs font-black uppercase tracking-wide text-green-700">{text.promoZone}</span>
        </div>
        <span className="text-[11px] font-black uppercase tracking-wide text-green-700">{text.topAdvance}</span>
      </div>

      <div className="space-y-2">
        {data.leaderboard.map((user, index) => (
          <LeaderboardRow
            key={user.id}
            rank={rankOffset + index + 1}
            user={user}
            isCurrentUser={user.id === data.currentUser.id}
          />
        ))}
      </div>
    </section>
  );
}
