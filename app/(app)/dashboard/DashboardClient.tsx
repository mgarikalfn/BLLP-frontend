"use client"; // This is the magic boundary

import { useDashboard } from "@/hooks/useDashboard";
import { ProgressHeader } from "@/features/dashboard/progressHeader";
import { StatsGrid } from "@/features/dashboard/StatsGrid";
import { UnitCard } from "@/features/dashboard/UnitCard";

export default function DashboardClient() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] font-sans pb-24">
      <ProgressHeader user={data.user} />
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-8">
        <UnitCard actions={data.actions} level={data.user.level} />
        <StatsGrid insights={data.insights} activity={data.activity} />
      </main>
    </div>
  );
}