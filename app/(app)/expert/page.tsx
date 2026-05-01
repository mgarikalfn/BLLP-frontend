"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Layers, LayoutDashboard, AlertTriangle } from "lucide-react";
import { getExpertStats } from "@/api/expert.api";
import { useAuthStore } from "@/store/authStore";
import type { ExpertDashboardStats } from "@/types/learning";

const emptyStats: ExpertDashboardStats = {
  totals: {},
  pending: {},
  published: {},
  topicCount: 0,
};

const sumValues = (record?: Record<string, number>) =>
  Object.values(record ?? {}).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);

const resolvePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  if ("data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }
  return payload;
};

const normalizeTypeKey = (key: string) => {
  const upper = key.toUpperCase().replace(/[\s-]+/g, "_");

  if (upper === "LESSON" || upper === "LESSONS") return "LESSON";
  if (upper === "DIALOGUE" || upper === "DIALOGUES") return "DIALOGUE";
  if (upper === "WRITING" || upper === "WRITINGS" || upper === "WRITING_EXERCISE" || upper === "WRITING_EXERCISES") {
    return "WRITING";
  }
  if (upper === "SPEAKING" || upper === "SPEAKINGS" || upper === "SPEAKING_EXERCISE" || upper === "SPEAKING_EXERCISES") {
    return "SPEAKING";
  }
  if (upper === "QUESTION" || upper === "QUESTIONS" || upper === "QUIZ" || upper === "QUIZZES") return "QUESTION";

  return upper;
};

const normalizeCountRecord = (input: unknown) => {
  const record: Record<string, number> = {};

  if (!input) return record;

  if (Array.isArray(input)) {
    input.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const item = entry as Record<string, unknown>;
      const rawKey = String(item.type ?? item._contentType ?? item.key ?? item.name ?? "");
      const rawValue = item.count ?? item.total ?? item.value ?? 0;
      if (!rawKey) return;
      const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
      if (!Number.isFinite(value)) return;
      const normalizedKey = normalizeTypeKey(rawKey);
      record[normalizedKey] = (record[normalizedKey] ?? 0) + value;
    });
    return record;
  }

  if (typeof input === "object") {
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      const normalizedKey = normalizeTypeKey(key);
      const numberValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numberValue)) return;
      record[normalizedKey] = (record[normalizedKey] ?? 0) + numberValue;
    });
  }

  return record;
};

const normalizeStats = (payload: unknown): ExpertDashboardStats => {
  if (!payload || typeof payload !== "object") {
    return emptyStats;
  }

  const record = payload as Record<string, unknown>;

  const totals = normalizeCountRecord(record.totals ?? record.total ?? record.byType ?? record.contentTotals);
  const pending = normalizeCountRecord(record.pending ?? record.pendingTotals ?? record.pendingByType);
  const published = normalizeCountRecord(record.published ?? record.publishedTotals ?? record.publishedByType);

  const topicCountRaw = record.topicCount ?? record.topics ?? record.totalTopics ?? 0;
  const topicCount = typeof topicCountRaw === "number" ? topicCountRaw : Number(topicCountRaw) || 0;

  return {
    totals,
    pending,
    published,
    topicCount,
  };
};

export default function ExpertDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const [stats, setStats] = useState<ExpertDashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (user?.role) {
      setRole(user.role);
      setIsCheckingRole(false);
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(typeof payload.role === "string" ? payload.role : null);
      } catch {
        setRole(null);
      }
    }

    setIsCheckingRole(false);
  }, [user?.role]);

  const isAllowed = role === "EXPERT" || role === "ADMIN";

  useEffect(() => {
    if (!isCheckingRole && !isAllowed) {
      router.replace("/dashboard");
    }
  }, [isCheckingRole, isAllowed, router]);

  useEffect(() => {
    if (!isAllowed) return;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getExpertStats();
        const resolved = resolvePayload(res.data);
        setStats(normalizeStats(resolved));
      } catch {
        setError("Failed to load expert stats. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStats();
  }, [isAllowed]);

  const totalsCount = useMemo(() => sumValues(stats.totals), [stats.totals]);
  const pendingCount = useMemo(() => sumValues(stats.pending), [stats.pending]);
  const publishedCount = useMemo(() => sumValues(stats.published), [stats.published]);

  const breakdownRows = [
    { label: "Lessons", key: "LESSON" },
    { label: "Dialogues", key: "DIALOGUE" },
    { label: "Writing", key: "WRITING" },
    { label: "Speaking", key: "SPEAKING" },
    { label: "Questions", key: "QUESTION" },
  ];

  if (isCheckingRole) {
    return <div className="px-6 py-10 text-sm font-semibold text-slate-500">Checking access...</div>;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border-b-4 border-emerald-600 bg-emerald-500 p-2 text-white">
            <LayoutDashboard size={22} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Expert Dashboard</h1>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Manage and review learning content
        </p>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Content</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {isLoading ? "—" : totalsCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600">
              <Layers size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700">Pending Review</p>
              <p className="mt-2 text-3xl font-black text-amber-900">
                {isLoading ? "—" : pendingCount}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-100 p-2 text-amber-700">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Published</p>
              <p className="mt-2 text-3xl font-black text-emerald-900">
                {isLoading ? "—" : publishedCount}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">Topics</p>
              <p className="mt-2 text-3xl font-black text-sky-900">
                {isLoading ? "—" : stats.topicCount}
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-100 p-2 text-sky-700">
              <LayoutDashboard size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Content Breakdown</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          <span>Type</span>
          <span>Total</span>
          <span>Pending</span>
          <span>Published</span>
        </div>
        <div className="mt-3 space-y-2">
          {breakdownRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-4 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <span>{row.label}</span>
              <span>{stats.totals[row.key] ?? 0}</span>
              <span>{stats.pending[row.key] ?? 0}</span>
              <span>{stats.published[row.key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/expert/review"
          className="flex-1 rounded-xl border-b-4 border-amber-500 bg-amber-400 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-amber-950 transition hover:translate-y-0.5 hover:border-b-2"
        >
          Review Queue
        </Link>
        <Link
          href="/expert/generate"
          className="flex-1 rounded-xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-white transition hover:translate-y-0.5 hover:border-b-2"
        >
          Generate Content
        </Link>
      </div>
    </div>
  );
}
