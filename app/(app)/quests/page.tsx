import { Trophy } from "lucide-react";
import { DailyQuestsList } from "@/features/quests/DailyQuestsList";
import { AchievementsList } from "@/features/quests/AchievementsList";

export default function QuestsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quests & Badges</h1>
          <p className="text-sm font-medium text-slate-600">
            Complete daily tasks and earn lifetime achievements!
          </p>
        </div>
      </div>

      <DailyQuestsList />
      <AchievementsList />
    </section>
  );
}
