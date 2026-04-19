import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardUser } from "@/types/LeaderboardData";
import { useLanguageStore } from "@/store/languageStore";

interface LeaderboardRowProps {
  rank: number;
  user: LeaderboardUser;
  isCurrentUser: boolean;
}

const rowText = {
  am: {
    you: "እርስዎ",
    keepGoing: "ቀጥሉ!",
    xp: "XP",
  },
  ao: {
    you: "Ati",
    keepGoing: "ITTII FUFII!",
    xp: "XP",
  },
} as const;

export function LeaderboardRow({ rank, user, isCurrentUser }: LeaderboardRowProps) {
  const lang = useLanguageStore((state) => state.lang);
  const text = rowText[lang];

  const rankColor =
    rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-500" : rank === 3 ? "text-amber-700" : "text-gray-500";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-b-4 px-4 py-3",
        isCurrentUser
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-white"
      )}
    >
      <div className={cn("w-8 text-center text-lg font-black", rankColor)}>{rank}</div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
        ) : (
          <UserCircle2 className="text-gray-400" size={24} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-gray-800">
          {isCurrentUser ? `${text.you} (${user.username})` : user.username}
        </p>
        {isCurrentUser ? <p className="text-[11px] font-bold text-green-600">{text.keepGoing}</p> : null}
      </div>

      <div className="text-right text-sm font-black text-gray-700">
        {user.seasonXp.toLocaleString()} {text.xp}
      </div>
    </div>
  );
}
