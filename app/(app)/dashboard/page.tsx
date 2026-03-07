"use client";

import { useDashboard } from "@/features/dashboard/useDashboard";
import DashboardStats from "@/features/dashboard/DashboardStats";
import DashboardProgress from "@/features/dashboard/DashboardProgress";

export default function DashboardPage() {

  const { data, loading } = useDashboard();

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      <DashboardStats
        xp={data.xp}
        streak={data.streak}
        level={data.level}
      />

      <DashboardProgress
        completedLessons={data.completedLessons}
        totalLessons={data.totalLessons}
      />

    </div>
  );
}