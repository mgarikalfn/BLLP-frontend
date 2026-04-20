import { Target } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { DashboardData } from "@/types/DashboardData";

const questText = {
  am: {
    title: "የዕለቱ ተልዕኮ",
    xpToday: "{today} / {goal} XP ዛሬ",
    lessonsDone: "የተጠናቀቁ ትምህርቶች",
    reviewsDone: "የተጠናቀቁ ግምገማዎች",
  },
  ao: {
    title: "Gaaffii Guyyaa",
    xpToday: "XP har'a: {today} / {goal}",
    lessonsDone: "Barnoota Xumuraman",
    reviewsDone: "Irra Deebii Xumuraman",
  },
} as const;

export function DailyQuestCard({ activity }: { activity: DashboardData["activity"] }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = questText[lang];

  const dailyGoal = activity.dailyGoal || 1;
  const todayCount = activity.todayCount || 0;
  const progress = Math.min((todayCount / dailyGoal) * 100, 100);

  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl border-b-4 border-orange-500 bg-orange-400 p-2 text-white">
          <Target size={22} />
        </div>
        <h3 className="text-lg font-black text-gray-800">{text.title}</h3>
      </div>

      <p className="mb-3 text-sm font-bold text-gray-600">
        {text.xpToday.replace("{today}", String(todayCount)).replace("{goal}", String(dailyGoal))}
      </p>

      <div className="mb-4 h-4 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-orange-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
          {text.lessonsDone}: {activity.lessonsToday}
        </span>
        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
          {text.reviewsDone}: {activity.reviewsToday}
        </span>
      </div>
    </section>
  );
}
