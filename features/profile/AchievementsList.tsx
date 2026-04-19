import { Award } from "lucide-react";
import { ProfileData } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";

interface AchievementCardProps {
  title: string;
  description: string;
  progress: number;
}

export function AchievementCard({ title, description, progress }: AchievementCardProps) {
  const normalizedProgress = Math.max(0, Math.min(progress, 100));

  return (
    <article className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full border-2 border-yellow-200 bg-yellow-50 p-2 text-yellow-600">
          <Award size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-black text-gray-900">{title}</h4>
          <p className="mt-1 text-xs font-medium text-gray-500">{description}</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${normalizedProgress}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function AchievementsList({ achievements }: { achievements: ProfileData["achievements"] }) {
  const lang = useLanguageStore((state) => state.lang);
  const badges = achievements.badges || [];
  const text = {
    title: lang === "am" ? "ስኬቶች" : "Milkaa'inoota",
    viewAll: lang === "am" ? "ሁሉን ይመልከቱ" : "Hunda ilaali",
    empty:
      lang === "am"
        ? "ገና ምንም ስኬት የለም። ባጅ ለማግኘት ትምህርቶችን ያጠናቅቁ!"
        : "Ammaaf milkaa'inni hin jiru. Beejii argachuuf barnoota xumuri!",
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">{text.title}</h2>
        <button type="button" className="text-xs font-black uppercase tracking-[0.12em] text-green-600">
          {text.viewAll}
        </button>
      </div>

      {badges.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400">
            <Award size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-600">{text.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {badges.map((badge) => (
            <AchievementCard
              key={badge.id}
              title={badge.title}
              description={badge.description}
              progress={badge.progress}
            />
          ))}
        </div>
      )}
    </section>
  );
}
