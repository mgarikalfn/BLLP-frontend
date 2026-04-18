import { Brain } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { DashboardData } from "@/types/DashboardData";

const insightsText = {
  am: {
    title: "ግንዛቤ",
    fluency: "የቅልጥፍና ነጥብ",
    noWeak: "እስካሁን ድክመት አልተገኘም!",
    weakTitle: "ደካማ ርዕሶች",
  },
  ao: {
    title: "Hubannoo",
    fluency: "Sadarkaa Dandeettii",
    noWeak: "Ammaaf bakka dadhabaa hin argamne!",
    weakTitle: "Mata Dureewwan Dadhaboo",
  },
} as const;

export function InsightsCard({ insights }: { insights: DashboardData["insights"] }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = insightsText[lang];

  const mastery = Math.round((insights.mastery || 0) * 100);
  const weakTopics = insights.weakTopics || [];

  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl border-b-4 border-violet-600 bg-violet-500 p-2 text-white">
          <Brain size={22} />
        </div>
        <h3 className="text-lg font-black text-gray-800">{text.title}</h3>
      </div>

      <p className="text-sm font-bold text-gray-600">{text.fluency}</p>
      <p className="mb-4 text-3xl font-black text-gray-900">{mastery}%</p>

      {weakTopics.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="mb-2 text-sm font-black text-red-700">{text.weakTitle}</p>
          <ul className="space-y-1 text-sm font-semibold text-red-700">
            {weakTopics.map((topic) => (
              <li key={topic._id}>• {topic._id} ({topic.weakCount})</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {text.noWeak}
        </div>
      )}
    </section>
  );
}
