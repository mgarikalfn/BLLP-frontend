"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Layers, LayoutDashboard, AlertTriangle, Loader2 } from "lucide-react";
import { deleteTopic, generateTopic, getAllTopics, getExpertStats, publishTopic, updateTopic } from "@/api/expert.api";
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

const sectionBadgeStyles: Record<string, string> = {
  INTRO: "bg-purple-100 text-purple-700 border-purple-200",
  A1: "bg-sky-100 text-sky-700 border-sky-200",
  A2: "bg-blue-100 text-blue-700 border-blue-200",
  B1: "bg-indigo-100 text-indigo-700 border-indigo-200",
  B2: "bg-violet-100 text-violet-700 border-violet-200",
};

const resolveSectionBadge = (section?: string) =>
  section && sectionBadgeStyles[section] ? sectionBadgeStyles[section] : "bg-slate-100 text-slate-700 border-slate-200";

export default function ExpertDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const [stats, setStats] = useState<ExpertDashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [showGenerateTopic, setShowGenerateTopic] = useState(false);
  const [selectedTipsTopic, setSelectedTipsTopic] = useState<any | null>(null);
  const [generateForm, setGenerateForm] = useState({
    theme: "",
    section: "A1",
    level: "BEGINNER",
  });
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedEditTopic, setSelectedEditTopic] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    titleAm: "",
    titleAo: "",
    descriptionAm: "",
    descriptionAo: "",
    tipsAm: "",
    tipsAo: "",
    section: "A1",
    level: "BEGINNER",
    unitNumber: "",
    thumbnailUrl: "",
    isPublished: false,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const res = await getAllTopics();
      setTopics(Array.isArray(res.data) ? res.data : []);
    } catch {
      // fail silently — topics list is non-critical
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAllowed) return;
    void fetchTopics();
  }, [isAllowed]);

  const totalsCount = useMemo(() => sumValues(stats.totals), [stats.totals]);
  const pendingCount = useMemo(() => sumValues(stats.pending), [stats.pending]);
  const publishedCount = useMemo(() => sumValues(stats.published), [stats.published]);
  const hasTips = Boolean(selectedTipsTopic?.tips?.am || selectedTipsTopic?.tips?.ao);

  const closeGenerateModal = () => {
    setShowGenerateTopic(false);
    setGenerateError(null);
  };

  const openEditModal = (topic: any) => {
    setSelectedEditTopic(topic);
    setEditError(null);
    setEditForm({
      titleAm: topic?.title?.am ?? "",
      titleAo: topic?.title?.ao ?? "",
      descriptionAm: topic?.description?.am ?? "",
      descriptionAo: topic?.description?.ao ?? "",
      tipsAm: topic?.tips?.am ?? "",
      tipsAo: topic?.tips?.ao ?? "",
      section: topic?.section ?? "A1",
      level: topic?.level ?? "BEGINNER",
      unitNumber: Number.isFinite(Number(topic?.unitNumber)) ? String(topic.unitNumber) : "",
      thumbnailUrl: topic?.thumbnailUrl ?? "",
      isPublished: Boolean(topic?.isPublished),
    });
  };

  const closeEditModal = () => {
    setSelectedEditTopic(null);
    setEditError(null);
  };

  const handleGenerateTopic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTheme = generateForm.theme.trim();
    if (!trimmedTheme) {
      setGenerateError("Topic theme is required.");
      return;
    }

    setGenerateLoading(true);
    setGenerateError(null);

    try {
      await generateTopic({
        theme: trimmedTheme,
        section: generateForm.section,
        level: generateForm.level,
      });
      closeGenerateModal();
      setGenerateForm({ theme: "", section: "A1", level: "BEGINNER" });
      await fetchTopics();
    } catch {
      setGenerateError("Failed to generate topic. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const handlePublishTopic = async (id: string) => {
    try {
      await publishTopic(id);
      await fetchTopics();
    } catch {
      // silent failure
    }
  };

  const handleUpdateTopic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEditTopic?._id) return;

    const titleAm = editForm.titleAm.trim();
    const titleAo = editForm.titleAo.trim();
    const descriptionAm = editForm.descriptionAm.trim();
    const descriptionAo = editForm.descriptionAo.trim();
    const tipsAm = editForm.tipsAm.trim();
    const tipsAo = editForm.tipsAo.trim();
    const thumbnailUrl = editForm.thumbnailUrl.trim();

    if (!titleAm || !titleAo || !descriptionAm || !descriptionAo) {
      setEditError("Title and description are required.");
      return;
    }

    const parsedUnitNumber = Number(editForm.unitNumber);
    const unitNumber = Number.isFinite(parsedUnitNumber) ? parsedUnitNumber : undefined;

    setEditLoading(true);
    setEditError(null);

    try {
      await updateTopic(selectedEditTopic._id, {
        title: { am: titleAm, ao: titleAo },
        description: { am: descriptionAm, ao: descriptionAo },
        tips: { am: tipsAm, ao: tipsAo },
        section: editForm.section,
        level: editForm.level,
        unitNumber,
        thumbnailUrl,
        isPublished: editForm.isPublished,
      });
      closeEditModal();
      await fetchTopics();
    } catch {
      setEditError("Failed to update topic. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this topic? This cannot be undone.")) return;
    try {
      await deleteTopic(id);
      await fetchTopics();
    } catch (error) {
      console.error("Failed to delete topic", error);
      alert("Failed to delete topic. It might be in use.");
    }
  };

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

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Topics</h2>
        <button
          type="button"
          onClick={() => {
            setGenerateError(null);
            setShowGenerateTopic(true);
          }}
          className="rounded-xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-2 text-sm font-black uppercase tracking-widest text-white transition hover:translate-y-0.5 hover:border-b-2"
        >
          ✦ Generate Topic
        </button>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          <span>Section</span>
          <span>Unit#</span>
          <span>Title (Amharic)</span>
          <span>Level</span>
          <span>Tips</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        <div className="mt-3 space-y-2">
          {topicsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`topic-skeleton-${index}`}
                className="grid grid-cols-7 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-4 w-10 rounded bg-slate-200" />
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-200" />
                <div className="h-4 w-8 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
              </div>
            ))
          ) : topics.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
              No topics yet. Generate your first topic.
            </div>
          ) : (
            topics.map((topic) => {
              const sectionLabel = typeof topic.section === "string" ? topic.section : "—";
              const badgeClass = resolveSectionBadge(sectionLabel);
              const hasTipsIcon = Boolean(topic?.tips?.am);
              const isPublished = Boolean(topic?.isPublished);

              return (
                <div
                  key={topic._id ?? `${sectionLabel}-${topic.unitNumber}`}
                  className="grid grid-cols-7 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-[0.18em] ${badgeClass}`}
                  >
                    {sectionLabel}
                  </span>
                  <span>{topic.unitNumber ?? "—"}</span>
                  <span className="truncate">{topic?.title?.am ?? "Untitled"}</span>
                  <span className="uppercase">{topic?.level ?? "—"}</span>
                  <span>
                    {hasTipsIcon ? (
                      <button
                        type="button"
                        onClick={() => setSelectedTipsTopic(topic)}
                        className="transition-transform hover:scale-110"
                        title="View Tips"
                      >
                        💡
                      </button>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                        isPublished
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(topic)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(topic._id)}
                      className="rounded-lg border-b-2 border-rose-600 bg-rose-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:translate-y-0.5 hover:border-b"
                    >
                      Delete
                    </button>
                    {!isPublished ? (
                      <button
                        type="button"
                        onClick={() => handlePublishTopic(topic._id)}
                        className="rounded-lg border-b-2 border-emerald-600 bg-emerald-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:translate-y-0.5 hover:border-b"
                      >
                        Publish
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showGenerateTopic ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={closeGenerateModal}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeGenerateModal}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-500"
            >
              ✕
            </button>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">✦ Generate Topic with AI</h3>
              <p className="text-sm font-semibold text-slate-600">
                Gemini will create a bilingual topic with title, description, and grammar tips.
              </p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleGenerateTopic}>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Topic Theme</label>
                <input
                  value={generateForm.theme}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, theme: event.target.value }))}
                  placeholder="e.g. Greetings, Food & Drink, Family, Colors..."
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">CEFR Section</label>
                <select
                  value={generateForm.section}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, section: event.target.value }))}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="INTRO">INTRO (Introduction)</option>
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Level</label>
                <select
                  value={generateForm.level}
                  onChange={(event) => setGenerateForm((prev) => ({ ...prev, level: event.target.value }))}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generateLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:translate-y-0.5 hover:border-b-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {generateLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </form>

            {generateError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {generateError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {selectedTipsTopic ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedTipsTopic(null)}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTipsTopic(null)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-500"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-slate-900">
              💡 Tips — {selectedTipsTopic?.title?.am ?? "Topic"}
            </h3>

            {hasTips ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Amharic (አማርኛ)</p>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold text-slate-700">
                    {selectedTipsTopic?.tips?.am || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Afan Oromo (Oromoo)</p>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold text-slate-700">
                    {selectedTipsTopic?.tips?.ao || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-slate-600">
                No tips have been added to this topic yet.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {selectedEditTopic ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={closeEditModal}
        >
          <div className="absolute inset-0 bg-slate-900/60" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEditModal}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-500"
            >
              ✕
            </button>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Edit Topic</h3>
              <p className="text-sm font-semibold text-slate-600">Update the bilingual topic details below.</p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleUpdateTopic}>
              <div className="space-y-2">
                <label
                  htmlFor="edit-title-am"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Title (Amharic)
                </label>
                <input
                  id="edit-title-am"
                  value={editForm.titleAm}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, titleAm: event.target.value }))}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-title-ao"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Title (Afan Oromo)
                </label>
                <input
                  id="edit-title-ao"
                  value={editForm.titleAo}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, titleAo: event.target.value }))}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-description-am"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Description (Amharic)
                </label>
                <textarea
                  id="edit-description-am"
                  value={editForm.descriptionAm}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, descriptionAm: event.target.value }))}
                  className="w-full min-h-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-description-ao"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Description (Afan Oromo)
                </label>
                <textarea
                  id="edit-description-ao"
                  value={editForm.descriptionAo}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, descriptionAo: event.target.value }))}
                  className="w-full min-h-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-tips-am"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Tips (Amharic)
                </label>
                <textarea
                  id="edit-tips-am"
                  value={editForm.tipsAm}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, tipsAm: event.target.value }))}
                  className="w-full min-h-20 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-tips-ao"
                  className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                >
                  Tips (Afan Oromo)
                </label>
                <textarea
                  id="edit-tips-ao"
                  value={editForm.tipsAo}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, tipsAo: event.target.value }))}
                  className="w-full min-h-20 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="edit-thumbnail-url"
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                  >
                    Thumbnail URL
                  </label>
                  <input
                    id="edit-thumbnail-url"
                    value={editForm.thumbnailUrl}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="edit-status"
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                  >
                    Status
                  </label>
                  <select
                    id="edit-status"
                    value={editForm.isPublished ? "PUBLISHED" : "DRAFT"}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, isPublished: event.target.value === "PUBLISHED" }))
                    }
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Section</label>
                  <select
                    value={editForm.section}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, section: event.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="INTRO">INTRO</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Level</label>
                  <select
                    value={editForm.level}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, level: event.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="edit-unit-number"
                    className="text-xs font-black uppercase tracking-[0.2em] text-slate-500"
                  >
                    Unit #
                  </label>
                  <input
                    id="edit-unit-number"
                    type="number"
                    value={editForm.unitNumber}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, unitNumber: event.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-emerald-600 bg-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:translate-y-0.5 hover:border-b-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>

            {editError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {editError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
