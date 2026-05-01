"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { generateContent, getTopics } from "@/api/expert.api";
import { useAuthStore } from "@/store/authStore";
import type { ExpertContentType } from "@/types/learning";

interface TopicOption {
  _id: string;
  title?: {
    am?: string;
    ao?: string;
  };
}

const resolvePayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  if ("data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }
  return payload;
};

const formatLocalized = (value: unknown): string => {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const items = value
      .map((entry) => formatLocalized(entry))
      .filter((entry) => entry !== "—");
    return items.length > 0 ? items.join(" • ") : "—";
  }
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as { am?: string; ao?: string };
    const am = record.am?.trim();
    const ao = record.ao?.trim();
    if (am && ao) return `${am} / ${ao}`;
    return am || ao || "—";
  }
  return "—";
};

const formatTopicLabel = (topic: TopicOption) => {
  const am = topic.title?.am?.trim();
  const ao = topic.title?.ao?.trim();
  if (am && ao) return `${am} / ${ao}`;
  return am || ao || topic._id;
};

export default function ExpertGeneratePage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [contentType, setContentType] = useState<ExpertContentType>("LESSON");
  const [topicId, setTopicId] = useState<string>("");
  const [level, setLevel] = useState<string>("BEGINNER");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

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
    setError(null);
    try {
      const res = await getTopics();
      const resolved = resolvePayload(res.data) as TopicOption[] | null;
      setTopics(Array.isArray(resolved) ? resolved : []);
    } catch {
      setError("Failed to load topics. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchTopics();
  }, [fetchTopics, isAllowed]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topicId) {
      setError("Please select a topic before generating content.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateContent({ type: contentType, topicId, level });
      setResult(resolvePayload(res.data));
    } catch {
      setError("Generation failed. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const preview = useMemo(() => {
    if (!result) return null;
    const payload = result as Record<string, unknown>;

    if (contentType === "LESSON") {
      const lesson = (payload.lesson ?? payload) as Record<string, unknown>;
      const vocabulary = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
      const dialogue = Array.isArray(lesson.dialogue) ? lesson.dialogue : [];

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Title</h3>
            <p className="mt-1 text-lg font-bold text-slate-800">{formatLocalized(lesson.title)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Grammar Notes</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(lesson.grammarNotes)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Vocabulary</h3>
            <div className="mt-2 grid gap-2">
              {vocabulary.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">No vocabulary returned.</p>
              ) : (
                vocabulary.map((item: Record<string, unknown>, index: number) => (
                  <div key={`${String(item._id ?? index)}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-sm font-bold text-slate-800">{formatLocalized(item)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Dialogue Lines</h3>
            <div className="mt-2 space-y-2">
              {dialogue.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">No dialogue lines returned.</p>
              ) : (
                dialogue.map((line: Record<string, unknown>, index: number) => (
                  <div key={`${String(line._id ?? index)}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-slate-400">
                      {typeof line.speaker === "string" ? line.speaker : `Line ${index + 1}`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(line.text)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (contentType === "DIALOGUE") {
      const dialogue = (payload.dialogue ?? payload) as Record<string, unknown>;
      const lines = Array.isArray(dialogue.lines) ? dialogue.lines : [];

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Scenario</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(dialogue.scenario)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lines</h3>
            <div className="mt-2 space-y-2">
              {lines.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">No dialogue lines returned.</p>
              ) : (
                lines.map((line: Record<string, unknown>, index: number) => (
                  <div key={`${String(line._id ?? index)}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-slate-400">
                      {typeof line.characterId === "string" ? line.characterId : `Line ${index + 1}`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(line.content)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (contentType === "WRITING") {
      const writing = (payload.writing ?? payload.exercise ?? payload) as Record<string, unknown>;

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Prompt</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(writing.prompt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Hints</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(writing.hints)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Sample Answer</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(writing.sampleAnswer)}</p>
          </div>
        </div>
      );
    }

    if (contentType === "SPEAKING") {
      const speaking = (payload.speaking ?? payload.exercise ?? payload) as Record<string, unknown>;

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Prompt</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(speaking.prompt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Expected Text</h3>
            <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(speaking.expectedText)}</p>
          </div>
        </div>
      );
    }

    const questions = Array.isArray(payload.questions) ? payload.questions : [];

    return (
      <div className="space-y-3">
        {questions.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">No questions returned.</p>
        ) : (
          questions.map((question: Record<string, unknown>, index: number) => (
            <div key={`${String(question._id ?? index)}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{formatLocalized(question.prompt ?? question.question)}</p>
            </div>
          ))
        )}
      </div>
    );
  }, [contentType, result]);

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
          <div className="rounded-xl border-b-4 border-indigo-600 bg-indigo-500 p-2 text-white">
            <Sparkles size={22} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Generate Content</h1>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          Use AI to create new learning materials
        </p>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form
          onSubmit={handleGenerate}
          className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-black text-slate-900">Generation Form</h2>

          <div className="mt-4 space-y-4">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Content Type
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                value={contentType}
                onChange={(event) => setContentType(event.target.value as ExpertContentType)}
              >
                <option value="LESSON">Lesson</option>
                <option value="DIALOGUE">Dialogue</option>
                <option value="WRITING">Writing Exercise</option>
                <option value="SPEAKING">Speaking Exercise</option>
                <option value="QUESTION">Questions</option>
              </select>
            </label>

            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Topic
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
              >
                <option value="">Select a topic</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>
                    {formatTopicLabel(topic)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Level
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-indigo-700 bg-indigo-600 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:translate-y-0.5 hover:border-b-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Result Preview</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-700">
              Needs Review
            </span>
          </div>

          <div className="mt-4">
            {preview ? (
              <div className="space-y-4">{preview}</div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                Generated content will appear here after you run the generator.
              </p>
            )}
          </div>

          {result ? (
            <Link
              href="/expert/review"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-100"
            >
              View in Review Queue
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
