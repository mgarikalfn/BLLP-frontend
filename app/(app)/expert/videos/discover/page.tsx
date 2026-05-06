"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getTopics } from "@/api/expert.api";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { VideoCard, type VideoCardData } from "@/components/videos/VideoCard";

interface TopicOption {
  _id: string;
  title?: {
    am?: string;
    ao?: string;
  };
}

const levelOptions = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

const resolvePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return payload;
  if ("success" in payload && !(payload as { success?: boolean }).success) {
    throw new Error((payload as { message?: string }).message || "Request failed");
  }
  if ("data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }
  return payload;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const pickStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && Number(item.trim().length) > 0);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const formatTopicLabel = (topic: TopicOption) => {
  const am = topic.title?.am?.trim();
  const ao = topic.title?.ao?.trim();
  if (am && ao) return `${am} / ${ao}`;
  return am || ao || topic._id;
};

const resolveThumbnailFromSnippet = (snippet: Record<string, unknown>) => {
  const thumbnails = snippet.thumbnails;
  if (!isRecord(thumbnails)) return "";

  const keys = ["maxres", "standard", "high", "medium", "default"];
  for (const key of keys) {
    const entry = thumbnails[key];
    if (isRecord(entry) && typeof entry.url === "string") {
      return entry.url;
    }
  }

  return "";
};

const resolveVideoList = (payload: unknown) => {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    const candidates = [payload.videos, payload.items, payload.results, payload.data, payload.content];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [] as unknown[];
};

const normalizeVideos = (payload: unknown): VideoCardData[] => {
  const rawVideos = resolveVideoList(payload);

  return rawVideos
    .map((entry): VideoCardData | null => {
      if (!isRecord(entry)) return null;

      const snippet = isRecord(entry.snippet) ? entry.snippet : null;
      const youtubeId = pickString(
        entry.youtubeId,
        entry.youtube_id,
        entry.videoId,
        entry.id,
        snippet?.resourceId && isRecord(snippet.resourceId) ? snippet.resourceId.videoId : undefined,
        isRecord(entry.id) ? entry.id.videoId : undefined
      );
      const title = pickString(entry.title, entry.name, entry.videoTitle, snippet?.title) || "Untitled video";
      const thumbnailUrl = pickString(
        entry.thumbnailUrl,
        entry.thumbnail,
        entry.image,
        snippet ? resolveThumbnailFromSnippet(snippet) : ""
      );
      const tags = pickStringArray(entry.tags).length
        ? pickStringArray(entry.tags)
        : pickStringArray(snippet?.tags || entry.topics || entry.categories || entry.keywords);
      const status = typeof entry.status === "string" ? entry.status : "";
      const needsReview =
        typeof entry.needsReview === "boolean"
          ? entry.needsReview
          : status === "NEEDS_REVIEW" || status === "DRAFT" || !status;

      return {
        youtubeId,
        title,
        thumbnailUrl,
        tags,
        needsReview,
      };
    })
    .filter((entry): entry is VideoCardData => !!entry && !!entry.title);
};

export default function ExpertVideoDiscoveryPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [topicId, setTopicId] = useState<string>("");
  const [level, setLevel] = useState<string>("BEGINNER");
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [videos, setVideos] = useState<VideoCardData[]>([]);
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

  const fetchTopics = useCallback(async () => {
    setIsLoadingTopics(true);
    setTopicError(null);
    try {
      const res = await getTopics();
      const resolved = resolvePayload(res.data) as TopicOption[] | null;
      setTopics(Array.isArray(resolved) ? resolved : []);
    } catch {
      setTopicError("Failed to load topics. Please try again.");
    } finally {
      setIsLoadingTopics(false);
    }
  }, []);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchTopics();
  }, [fetchTopics, isAllowed]);

  const handleDiscover = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topicId) {
      setError("Please select a topic to discover videos.");
      return;
    }

    setError(null);
    setHasSearched(true);
    setIsDiscovering(true);
    setVideos([]);

    try {
      const res = await api.post("/youtube-videos/discover", { topicId, level });
      const resolved = resolvePayload(res.data);
      setVideos(normalizeVideos(resolved));
    } catch {
      setError("Discovery failed. Please try again in a moment.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const selectedTopic = useMemo(() => topics.find((topic) => topic._id === topicId), [topics, topicId]);

  if (isCheckingRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="size-4 animate-spin text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">Checking access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-48 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500 shadow-sm backdrop-blur">
            <Sparkles className="size-4 text-amber-500" />
            Expert discovery
          </div>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
            Let AI scout YouTube lessons in minutes.
          </h1>
          <p className="max-w-2xl text-sm font-semibold text-slate-600 md:text-base">
            Pick a topic and level, then review the curated clips before publishing to learners.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          >
            <form onSubmit={handleDiscover} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Topic</label>
                <div className="mt-2">
                  <select
                    value={topicId}
                    onChange={(event) => setTopicId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                    disabled={isLoadingTopics}
                  >
                    <option value="">Select a topic</option>
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {formatTopicLabel(topic)}
                      </option>
                    ))}
                  </select>
                </div>
                {topicError ? (
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-600">
                    <AlertTriangle className="size-4" />
                    {topicError}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Level</label>
                <div className="mt-2">
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                  >
                    {levelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
                  <AlertTriangle className="size-4" />
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                variant="super"
                className="h-12 w-full rounded-2xl text-sm font-black"
                disabled={isDiscovering || !topicId}
              >
                {isDiscovering ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Discover videos
              </Button>
            </form>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/60 bg-linear-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.25)]"
          >
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60">Discovery pipeline</p>
              <h2 className="text-2xl font-black">AI gathers fresh video clips for review.</h2>
              <ul className="space-y-3 text-sm font-semibold text-white/80">
                <li>1. Analyze the selected topic and level.</li>
                <li>2. Search YouTube for language-rich lessons.</li>
                <li>3. Prepare clips that match your curriculum.</li>
              </ul>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-white/70">
                {selectedTopic ? (
                  <span>
                    Focusing on {formatTopicLabel(selectedTopic)} for {level.toLowerCase()} learners.
                  </span>
                ) : (
                  <span>Select a topic to see the AI focus preview.</span>
                )}
              </div>
            </div>
          </motion.aside>
        </div>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Discovery results</h2>
              <p className="text-sm font-semibold text-slate-600">
                Each clip arrives marked as Needs Review.
              </p>
            </div>
            {videos.length > 0 ? (
              <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {videos.length} videos
              </span>
            ) : null}
          </div>

          {isDiscovering ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm"
            >
              <Loader2 className="size-5 animate-spin text-sky-500" />
              AI is analyzing topic and searching YouTube...
            </motion.div>
          ) : null}

          {!isDiscovering && hasSearched && videos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No videos found for this topic yet. Try another level or topic.
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video, index) => (
              <motion.div
                key={`${video.youtubeId || "video"}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <VideoCard video={video} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
