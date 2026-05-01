"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { getPendingContent, getTopics, rejectContent, verifyContent } from "@/api/expert.api";
import { useAuthStore } from "@/store/authStore";
import type { ExpertContentItem, ExpertContentType } from "@/types/learning";

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

const formatTopicLabel = (topic: TopicOption) => {
  const am = topic.title?.am?.trim();
  const ao = topic.title?.ao?.trim();
  if (am && ao) return `${am} / ${ao}`;
  return am || ao || topic._id;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const findNestedRecord = (
  value: unknown,
  predicate: (record: Record<string, unknown>) => boolean,
  maxDepth: number = 3
): Record<string, unknown> | null => {
  if (maxDepth < 0) return null;

  if (isRecord(value)) {
    if (predicate(value)) return value;
    for (const key of Object.keys(value)) {
      const found = findNestedRecord(value[key], predicate, maxDepth - 1);
      if (found) return found;
    }
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findNestedRecord(entry, predicate, maxDepth - 1);
      if (found) return found;
    }
  }

  return null;
};

const findLessonDetails = (payload: unknown) => {
  if (isRecord(payload) && isRecord(payload.lesson)) {
    return payload.lesson;
  }

  return findNestedRecord(
    payload,
    (record) =>
      "vocabulary" in record ||
      "grammarNotes" in record ||
      "grammarNote" in record ||
      "dialogue" in record ||
      "lines" in record
  );
};

const pickDetailPayload = (item: ExpertContentItem, type: ExpertContentType) => {
  const record = item as unknown as Record<string, unknown>;
  const base = record.content ?? record.payload ?? record.data ?? record.generated;

  if (type === "LESSON") {
    return record.lesson ?? base ?? record;
  }

  if (type === "DIALOGUE") {
    return record.dialogue ?? base ?? record;
  }

  if (type === "WRITING") {
    return record.writing ?? record.exercise ?? base ?? record;
  }

  if (type === "SPEAKING") {
    return record.speaking ?? record.exercise ?? base ?? record;
  }

  if (type === "QUESTION") {
    return record.question ?? record.questions ?? base ?? record;
  }

  return base ?? record;
};

const renderJson = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to preview data.";
  }
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  NEEDS_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
};

const typeMeta: Record<ExpertContentType, { label: string; icon: string; badge: string }> = {
  LESSON: { label: "Lesson", icon: "📝", badge: "bg-sky-50 text-sky-600" },
  DIALOGUE: { label: "Dialogue", icon: "💬", badge: "bg-indigo-50 text-indigo-600" },
  WRITING: { label: "Writing", icon: "✍️", badge: "bg-rose-50 text-rose-600" },
  SPEAKING: { label: "Speaking", icon: "🎤", badge: "bg-purple-50 text-purple-600" },
  QUESTION: { label: "Question", icon: "❓", badge: "bg-amber-50 text-amber-600" },
};

export default function ExpertReviewPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const [items, setItems] = useState<ExpertContentItem[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [contentType, setContentType] = useState<ExpertContentType | "ALL">("ALL");
  const [topicId, setTopicId] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ExpertContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        type: contentType === "ALL" ? undefined : contentType,
        topicId: topicId === "ALL" ? undefined : topicId,
      };

      const res = await getPendingContent(params);
      const resolved = resolvePayload(res.data) as ExpertContentItem[] | null;
      setItems(Array.isArray(resolved) ? resolved : []);
    } catch {
      setError("Failed to load pending content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [contentType, topicId]);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchTopics();
  }, [fetchTopics, isAllowed]);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchItems();
  }, [fetchItems, isAllowed]);

  const pendingCount = useMemo(() => items.length, [items.length]);

  const handlePublish = async (item: ExpertContentItem) => {
    setActionId(item._id);
    setError(null);

    try {
      await verifyContent(item._contentType, item._id);
      await fetchItems();
    } catch {
      setError("Failed to publish content. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (item: ExpertContentItem) => {
    setActionId(item._id);
    setError(null);

    try {
      await rejectContent(item._contentType, item._id);
      await fetchItems();
    } catch {
      setError("Failed to reject content. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const openModal = (item: ExpertContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (isCheckingRole) {
    return <div className="px-6 py-10 text-sm font-semibold text-slate-500">Checking access...</div>;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Review Queue</h1>
          <p className="text-sm font-semibold text-slate-600">Pending content awaiting verification</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-700">
          {pendingCount} pending
        </span>
      </div>

      {error ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Content Type
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            value={contentType}
            onChange={(event) => setContentType(event.target.value as ExpertContentType | "ALL")}
          >
            <option value="ALL">All</option>
            <option value="LESSON">Lesson</option>
            <option value="DIALOGUE">Dialogue</option>
            <option value="WRITING">Writing</option>
            <option value="SPEAKING">Speaking</option>
            <option value="QUESTION">Question</option>
          </select>
        </label>

        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Topic
          <select
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
          >
            <option value="ALL">All Topics</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {formatTopicLabel(topic)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
        <div className="min-w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">AI</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading content...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-emerald-600">
                    All content is reviewed! 🎉
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const meta = typeMeta[item._contentType];
                  const statusClass = statusStyles[item.status ?? "DRAFT"] ?? statusStyles.DRAFT;

                  return (
                    <tr
                      key={item._id}
                      className="cursor-pointer text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={() => openModal(item)}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase ${meta.badge}`}>
                          <span>{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{item._title}</td>
                      <td className="px-4 py-3">
                        {item.level ? (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600">
                            {item.level}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-black uppercase ${statusClass}`}>
                          {item.status ?? "DRAFT"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-lg">{item.generatedByAI ? "🤖" : "—"}</td>
                      <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handlePublish(item);
                            }}
                            disabled={actionId === item._id}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle2 size={14} />
                            Publish
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleReject(item);
                            }}
                            disabled={actionId === item._id}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black uppercase text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled
                            title="Coming soon"
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Content Preview</p>
                <h3 className="mt-1 text-xl font-black text-slate-900">{selectedItem._title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {typeMeta[selectedItem._contentType].label}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
              {(() => {
                const payload = pickDetailPayload(selectedItem, selectedItem._contentType);

                if (selectedItem._contentType === "LESSON") {
                  const lesson = (findLessonDetails(payload) ?? (isRecord(payload) ? payload : {})) as Record<string, unknown>;
                  const rawVocabulary =
                    lesson.vocabulary ??
                    lesson.vocab ??
                    lesson.vocabularyItems ??
                    lesson.words ??
                    lesson.items;
                  const rawDialogue = lesson.dialogue ?? lesson.dialogueLines ?? lesson.lines ?? lesson.dialogues;
                  const grammarNotes =
                    lesson.grammarNotes ??
                    lesson.grammarNote ??
                    lesson.grammar ??
                    lesson.grammar_notes ??
                    lesson.notes;
                  const vocabulary = Array.isArray(rawVocabulary) ? rawVocabulary : [];
                  const dialogue = Array.isArray(rawDialogue) ? rawDialogue : [];

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Title</h4>
                        <p className="mt-2 text-lg font-bold text-slate-800">
                          {formatLocalized(lesson.title ?? selectedItem._title)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grammar Notes</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(grammarNotes)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Vocabulary</h4>
                        <div className="mt-2 grid gap-2">
                          {vocabulary.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No vocabulary returned.</p>
                          ) : (
                            vocabulary.map((item, index) => (
                              <div
                                key={`${String((item as Record<string, unknown>)._id ?? index)}`}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <p className="text-sm font-semibold text-slate-800">
                                  {formatLocalized(
                                    (isRecord(item) ? item.word ?? item.text ?? item.content ?? item : item)
                                  )}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Dialogue Lines</h4>
                        <div className="mt-2 space-y-2">
                          {dialogue.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No dialogue lines returned.</p>
                          ) : (
                            dialogue.map((line, index) => {
                              const record = line as Record<string, unknown>;
                              const speaker =
                                record.speaker ?? record.character ?? record.name ?? record.characterName ?? null;
                              const lineText =
                                record.text ?? record.content ?? record.line ?? record.sentence ?? record.prompt;
                              return (
                                <div
                                  key={`${String(record._id ?? index)}`}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                                >
                                  <p className="text-xs font-black uppercase text-slate-400">
                                    {typeof speaker === "string" ? speaker : `Line ${index + 1}`}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {formatLocalized(lineText)}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (selectedItem._contentType === "DIALOGUE") {
                  const dialogue = payload as Record<string, unknown>;
                  const lines = Array.isArray(dialogue.lines) ? dialogue.lines : [];

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scenario</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(dialogue.scenario)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Lines</h4>
                        <div className="mt-2 space-y-2">
                          {lines.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No dialogue lines returned.</p>
                          ) : (
                            lines.map((line, index) => {
                              const record = line as Record<string, unknown>;
                              return (
                                <div
                                  key={`${String(record._id ?? index)}`}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                                >
                                  <p className="text-xs font-black uppercase text-slate-400">
                                    {typeof record.characterId === "string" ? record.characterId : `Line ${index + 1}`}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-700">
                                    {formatLocalized(record.content)}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (selectedItem._contentType === "WRITING") {
                  const writing = payload as Record<string, unknown>;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Instruction</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(writing.instruction)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Prompt</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(writing.prompt)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hints</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(writing.hints)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sample Answer</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(writing.sampleAnswer)}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (selectedItem._contentType === "SPEAKING") {
                  const speaking = payload as Record<string, unknown>;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Prompt</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(speaking.prompt ?? speaking.text)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Expected Text</h4>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatLocalized(speaking.expectedText ?? speaking.script)}
                        </p>
                      </div>
                    </div>
                  );
                }

                const questions = Array.isArray(payload) ? payload : Array.isArray((payload as Record<string, unknown>).questions)
                  ? ((payload as Record<string, unknown>).questions as unknown[])
                  : [];

                if (selectedItem._contentType === "QUESTION" && questions.length > 0) {
                  return (
                    <div className="space-y-3">
                      {questions.map((question, index) => {
                        const record = question as Record<string, unknown>;
                        return (
                          <div key={`${String(record._id ?? index)}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <p className="text-xs font-black uppercase text-slate-400">Question {index + 1}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {formatLocalized(record.prompt ?? record.question ?? record.content)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    <pre className="whitespace-pre-wrap">{renderJson(payload)}</pre>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
