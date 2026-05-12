"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BookOpen, ClipboardCheck, UserPlus, Users, UserCheck, AlertTriangle } from "lucide-react";
import { fetchAnalytics, fetchContentStats, type AnalyticsView, type ContentStatsView } from "@/api/admin.api";

const emptyStats: ContentStatsView = {
  totalUsers: 0,
  totalExperts: 0,
  totalTopics: 0,
  totalLessons: 0,
  totalQuestions: 0,
  lessonsPendingReview: 0,
  pendingReports: 0,
};

const emptyAnalytics: AnalyticsView = {
  dailyActiveUsers: 0,
  usersJoinedToday: 0,
  weakContent: [],
};

const resolveErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const normalizeContentType = (value: string) => value.toUpperCase().replace(/\s+/g, "_");

const contentTypeStyles: Record<string, string> = {
  LESSON: "bg-emerald-100 text-emerald-700 border-emerald-200",
  VOCABULARY: "bg-blue-100 text-blue-700 border-blue-200",
  DIALOGUE: "bg-purple-100 text-purple-700 border-purple-200",
  WRITING: "bg-orange-100 text-orange-700 border-orange-200",
  SPEAKING: "bg-sky-100 text-sky-700 border-sky-200",
  QUESTION: "bg-amber-100 text-amber-700 border-amber-200",
  QUIZ: "bg-amber-100 text-amber-700 border-amber-200",
  VIDEO: "bg-rose-100 text-rose-700 border-rose-200",
};

const getContentTypeBadge = (value: string) => {
  const key = normalizeContentType(value || "");
  return contentTypeStyles[key] ?? "bg-slate-100 text-slate-700 border-slate-200";
};

const getEaseTone = (value: number) => {
  if (value < 1.5) return "text-rose-600";
  if (value < 2.0) return "text-amber-600";
  return "text-emerald-600";
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ContentStatsView>(emptyStats);
  const [analytics, setAnalytics] = useState<AnalyticsView>(emptyAnalytics);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoading = statsLoading || analyticsLoading;

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setStatsLoading(true);
      setAnalyticsLoading(true);
      setError(null);

      const [statsResult, analyticsResult] = await Promise.allSettled([
        fetchContentStats(),
        fetchAnalytics(),
      ]);

      if (!active) return;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      } else {
        setError(resolveErrorMessage(statsResult.reason, "Failed to load admin stats."));
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value);
      } else if (!error) {
        setError(resolveErrorMessage(analyticsResult.reason, "Failed to load analytics."));
      }

      setStatsLoading(false);
      setAnalyticsLoading(false);
    };

    void loadData();

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Daily Active Users</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Activity size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {analyticsLoading ? "..." : analytics.dailyActiveUsers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">New Users Today</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <UserPlus size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {analyticsLoading ? "..." : analytics.usersJoinedToday.toLocaleString()}
          </p>
        </div>

        <Link href="/admin/moderation" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-rose-500">Pending Reports</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle size={18} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-black text-rose-900">
              {isLoading ? "..." : stats.pendingReports.toLocaleString()}
            </p>
          </div>
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Insights</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Content Requiring Attention (Low Ease Factor)</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Identify items learners struggle with based on spaced repetition performance.
          </p>
        </div>

        {analyticsLoading ? (
          <div className="px-5 py-8 text-center text-sm font-semibold text-slate-400">Loading analytics...</div>
        ) : analytics.weakContent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm font-semibold text-emerald-600">
            All content is performing well! Users are learning smoothly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-3">Content</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Ease Factor</th>
                  <th className="px-5 py-3">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.weakContent.map((item) => {
                  const easeValue = Number.isFinite(item.averageEaseFactor)
                    ? item.averageEaseFactor
                    : 0;
                  const easeTone = getEaseTone(easeValue);
                  const previewText = item.preview?.trim();
                  const fallbackId = item._id ? `${item._id.slice(0, 10)}...` : "Unknown";
                  const displayText = previewText || fallbackId;
                  const subText = previewText ? `ID: ${fallbackId}` : "";

                  return (
                    <tr key={`${item._id}-${item.contentType}`} className="text-slate-700">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-800">{displayText}</div>
                        {subText ? <div className="text-xs text-slate-400">{subText}</div> : null}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${getContentTypeBadge(
                            item.contentType
                          )}`}
                        >
                          {item.contentType}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-black ${easeTone}`}>{easeValue.toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-600">
                        {item.numberOfReviews.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
