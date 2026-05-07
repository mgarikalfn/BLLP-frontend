"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type VideoCardData = {
  _id?: string;
  youtubeId: string;
  title: string;
  thumbnailUrl?: string;
  tags?: string[];
  needsReview?: boolean;
  isVerified?: boolean;
};

interface VideoCardProps {
  video: VideoCardData;
  className?: string;
  onVerify?: (id: string) => void;
}

const buildFallbackThumbnail = (youtubeId: string) =>
  youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "";

const compactTags = (tags: string[] = []) => {
  const cleaned = tags.map((tag) => tag.trim()).filter(Boolean);
  if (cleaned.length <= 3) return { tags: cleaned, overflow: 0 };
  return { tags: cleaned.slice(0, 3), overflow: cleaned.length - 3 };
};

export function VideoCard({ video, className, onVerify }: VideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canPlay = Boolean(video.youtubeId);
  const title = video.title || "Untitled video";
  const thumbnail = video.thumbnailUrl || buildFallbackThumbnail(video.youtubeId);
  const { tags, overflow } = useMemo(() => compactTags(video.tags), [video.tags]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => canPlay && setIsOpen(true)}
        disabled={!canPlay}
        whileHover={{ y: -6, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/70 text-left shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        aria-label={`Play ${title}`}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-200 via-slate-100 to-white text-sm font-semibold text-slate-500">
              Preview not available
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

          {video.needsReview ? (
            <span className="absolute left-4 top-4 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-black uppercase tracking-widest text-white shadow-sm">
              Needs review
            </span>
          ) : null}

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                {video.isVerified ? "Verified" : "Video"}
              </p>
              <h3 className="mt-1 text-lg font-black leading-snug text-white">{title}</h3>
            </div>
            <span className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition group-hover:bg-white/30">
              <Play className="size-5" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  {tag}
                </span>
              ))}
              {overflow > 0 ? (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  +{overflow} more
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Curated language clip
            </p>
          )}

          <p className="text-sm font-semibold text-slate-600">Tap to play and practice listening.</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-120 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_30px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${title} video player`}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close video"
              >
                <X className="size-5" />
              </button>

              <div className="aspect-video w-full bg-black">
                {video.youtubeId ? (
                  <iframe
                    title={title}
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>

              <div className="space-y-3 px-6 pb-6 pt-5 text-white">
                <div className="flex flex-wrap items-center gap-3">
                  {video.needsReview ? (
                    <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                      Needs review
                    </span>
                  ) : null}
                  {video.isVerified ? (
                    <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                      Verified
                    </span>
                  ) : null}
                  {!video.isVerified && onVerify && video._id ? (
                    <button
                      type="button"
                      onClick={() => {
                        onVerify(video._id!);
                        setIsOpen(false);
                      }}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-1 text-xs font-black uppercase tracking-widest text-white transition shadow-sm"
                    >
                      Verify Video
                    </button>
                  ) : null}
                </div>
                <h3 className="text-2xl font-black leading-tight">{title}</h3>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={`modal-${tag}`}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
