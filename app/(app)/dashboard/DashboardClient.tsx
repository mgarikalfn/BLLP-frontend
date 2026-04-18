"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { ProgressHeader } from "@/features/dashboard/progressHeader";
import { LessonHeroCard } from "@/features/dashboard/LessonHeroCard";
import { PracticeCard } from "@/features/dashboard/PracticeCard";
import { DailyQuestCard } from "@/features/dashboard/DailyQuestCard";
import { InsightsCard } from "@/features/dashboard/InsightsCard";

export default function DashboardClient() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] font-sans pb-24">
      <ProgressHeader user={data.user} />
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-6">
        <LessonHeroCard actions={data.actions} />
        <PracticeCard actions={data.actions} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DailyQuestCard activity={data.activity} />
          <InsightsCard insights={data.insights} />
        </div>
      </main>
    </div>
  );
}