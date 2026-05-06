"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VideoCard, type VideoCardData } from "@/components/videos/VideoCard";

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
      const isVerified = typeof entry.isVerified === "boolean" ? entry.isVerified : status === "PUBLISHED";

      return {
        youtubeId,
        title,
        thumbnailUrl,
        tags,
        isVerified,
      };
    })
    .filter((entry): entry is VideoCardData => !!entry && !!entry.title);
};

const suggestions = ["Greetings", "Travel phrases", "Daily routines", "Business basics", "Pronunciation"];

export default function LearnerVideosPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [videos, setVideos] = useState<VideoCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (term: string) => {
    if (!term) {
      setVideos([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const res = await api.get("/youtube-videos/search", { params: { q: term } });
      const resolved = resolvePayload(res.data);
      setVideos(normalizeVideos(resolved));
    } catch {
      setError("Search failed. Please try another query.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = query.trim();
      setSearchTerm((prev) => (prev === trimmed ? prev : trimmed));
    }, 450);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!searchTerm) {
      setVideos([]);
      setError(null);
      return;
    }
    void runSearch(searchTerm);
  }, [searchTerm, runSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchTerm((prev) => (prev === trimmed ? prev : trimmed));
  };

  const resultsLabel = useMemo(() => {
    if (!searchTerm) return "Start typing to explore verified videos.";
    if (isSearching) return "Searching for the best clips...";
    if (videos.length === 0) return "No videos found yet. Try another search.";
    return `${videos.length} verified video${videos.length === 1 ? "" : "s"} found.`;
  }, [searchTerm, isSearching, videos.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -top-32 left-12 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-500 shadow-sm backdrop-blur">
            <Search className="size-4 text-emerald-500" />
            Video library
          </div>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl">
            Search verified videos made for language learners.
          </h1>
          <p className="max-w-2xl text-sm font-semibold text-slate-600 md:text-base">
            Find short, curated clips aligned with your lessons and practice at your own pace.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for topics, phrases, or skills"
            className="h-16 w-full rounded-3xl border border-white/70 bg-white/80 pl-14 pr-32 text-base font-semibold text-slate-700 shadow-[0_20px_55px_rgba(15,23,42,0.12)] outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-emerald-400"
          >
            Search
          </button>
        </motion.form>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                setSearchTerm((prev) => (prev === term ? prev : term));
              }}
              className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-600">{resultsLabel}</p>
          {isSearching ? (
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Searching
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-600">
            {error}
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
      </div>
    </div>
  );
}
