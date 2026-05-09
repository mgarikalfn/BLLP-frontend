"use client";

import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Users, UserCheck } from "lucide-react";
import { fetchContentStats, type ContentStatsView } from "@/api/admin.api";

const emptyStats: ContentStatsView = {
  totalUsers: 0,
  totalExperts: 0,
  totalTopics: 0,
  totalLessons: 0,
  totalQuestions: 0,
  lessonsPendingReview: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ContentStatsView>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchContentStats();
        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load admin stats.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Admin Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Overview</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Track platform activity and manage operational health at a glance.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Users</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {isLoading ? "..." : stats.totalUsers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Experts</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {isLoading ? "..." : stats.totalExperts.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Lessons</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {isLoading ? "..." : stats.totalLessons.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pending Reviews</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ClipboardCheck size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {isLoading ? "..." : stats.lessonsPendingReview.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
