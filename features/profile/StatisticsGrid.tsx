import { Flame, Shield, Zap } from "lucide-react";
import { ProfileData } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";
import { getLocalizedTier } from "@/lib/tierTranslations";

interface StatisticsGridProps {
  stats: ProfileData["stats"];
}

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => {
  return (
    <article className="rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 inline-flex rounded-xl bg-gray-50 p-2">{icon}</div>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-gray-500">{label}</p>
    </article>
  );
};

export function StatisticsGrid({ stats }: StatisticsGridProps) {
  const lang = useLanguageStore((state) => state.lang);
  const text = {
    title: lang === "am" ? "ስታቲስቲክስ" : "Istaatistiksii",
    totalXp: lang === "am" ? "ጠቅላላ XP" : "Waliigala XP",
    currentStreak: lang === "am" ? "የአሁኑ ስትሪክ" : "Streekii Amma",
    currentLeague: lang === "am" ? "የአሁኑ ሊግ" : "Liigii Amma",
    days: lang === "am" ? "ቀናት" : "Guyyaa",
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black text-gray-900">{text.title}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          icon={<Zap className="text-green-600" size={20} />}
          value={stats.totalXp.toLocaleString()}
          label={text.totalXp}
        />
        <StatCard
          icon={<Flame className="text-orange-500" size={20} />}
          value={`${stats.currentStreak} ${text.days}`}
          label={text.currentStreak}
        />
        <StatCard
          icon={<Shield className="text-yellow-500" size={20} />}
          value={getLocalizedTier(stats.tier, lang)}
          label={text.currentLeague}
        />
      </div>
    </section>
  );
}
