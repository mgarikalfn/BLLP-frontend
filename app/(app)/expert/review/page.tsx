"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, X, XCircle, Play, RefreshCw, Volume2 } from "lucide-react";
import { generateQuestions, getLessonById, getPendingContent, getTopics, rejectContent, updateExpertContent, updateLesson, verifyContent, generateLessonAudio, regenerateAudio, getPendingReports, resolveReport } from "@/api/expert.api";
import { useAuthStore } from "@/store/authStore";
import type { ExpertContentItem, ExpertContentType, ChatReport } from "@/types/learning";
import { QuestionEditor, QuestionRecord } from "@/components/expert/QuestionEditor";

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

const isLocalizedRecord = (value: unknown): value is { am?: unknown; ao?: unknown } => {
  return isRecord(value) && ("am" in value || "ao" in value);
};

const toLocalizedRecord = (value: unknown) => {
  if (isLocalizedRecord(value)) {
    return {
      am: typeof value.am === "string" ? value.am : "",
      ao: typeof value.ao === "string" ? value.ao : "",
    };
  }

  if (typeof value === "string") {
    return { am: value, ao: value };
  }

  return { am: "", ao: "" };
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

type ToastState = {
  type: "success" | "error";
  message: string;
};

type LessonDraft = {
  title: { am: string; ao: string };
  grammarNotes: { am: string; ao: string };
  vocabulary: Array<Record<string, unknown>>;
  dialogue: Array<Record<string, unknown>>;
  quiz: Array<Record<string, unknown>>;
};

type DialogueDraft = {
  scenario: { am: string; ao: string };
  lines: Array<Record<string, unknown>>;
};

type WritingDraft = {
  instruction: { am: string; ao: string };
  prompt: { am: string; ao: string };
  sampleAnswer: { am: string; ao: string };
  hints: Array<{ am: string; ao: string }>;
};

type SpeakingDraft = {
  prompt: { am: string; ao: string };
  expectedText: { am: string; ao: string };
};

const normalizeVocabularyItem = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    return { am: "", ao: "" };
  }

  const example = isRecord(value.example)
    ? {
        am: typeof value.example.am === "string" ? value.example.am : undefined,
        ao: typeof value.example.ao === "string" ? value.example.ao : undefined,
      }
    : value.example;

  return {
    ...value,
    am: typeof value.am === "string" ? value.am : "",
    ao: typeof value.ao === "string" ? value.ao : "",
    example,
  };
};

const normalizeDialogueLine = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    return { speaker: "", text: { am: "", ao: "" } };
  }

  return {
    ...value,
    speaker: typeof value.speaker === "string" ? value.speaker : "",
    text: toLocalizedRecord(value.text),
  };
};

const buildLessonDraft = (source: Record<string, unknown>): LessonDraft => {
  const rawVocabulary =
    source.vocabulary ?? source.vocab ?? source.vocabularyItems ?? source.words ?? source.items ?? [];
  const rawDialogue =
    source.dialogue ?? source.dialogueLines ?? source.lines ?? source.dialogues ?? [];
  const rawQuiz = source.quiz ?? source.questions ?? [];

  return {
    title: toLocalizedRecord(source.title ?? source._title ?? ""),
    grammarNotes: toLocalizedRecord(
      source.grammarNotes ?? source.grammarNote ?? source.grammar ?? source.grammar_notes ?? source.notes ?? ""
    ),
    vocabulary: Array.isArray(rawVocabulary) ? rawVocabulary.map(normalizeVocabularyItem) : [],
    dialogue: Array.isArray(rawDialogue) ? rawDialogue.map(normalizeDialogueLine) : [],
    quiz: Array.isArray(rawQuiz)
      ? rawQuiz.map((item) => (isRecord(item) ? { ...item } : { value: item }))
      : [],
  };
};

const normalizeDialogueContentLine = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    return { characterId: "", content: { am: "", ao: "" } };
  }

  return {
    ...value,
    characterId:
      typeof value.characterId === "string"
        ? value.characterId
        : typeof value.speaker === "string"
          ? value.speaker
          : "",
    content: toLocalizedRecord(value.content ?? value.text ?? value.line ?? value.prompt),
  };
};

const buildDialogueDraft = (source: Record<string, unknown>): DialogueDraft => {
  const rawLines =
    source.lines ?? source.dialogue ?? source.dialogueLines ?? source.dialogues ?? source.script ?? [];

  return {
    scenario: toLocalizedRecord(source.scenario ?? source.context ?? source.title ?? ""),
    lines: Array.isArray(rawLines) ? rawLines.map(normalizeDialogueContentLine) : [],
  };
};

const toLocalizedArray = (value: unknown): Array<{ am: string; ao: string }> => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => toLocalizedRecord(item));
};

const buildWritingDraft = (source: Record<string, unknown>): WritingDraft => {
  return {
    instruction: toLocalizedRecord(source.instruction ?? ""),
    prompt: toLocalizedRecord(source.prompt ?? ""),
    sampleAnswer: toLocalizedRecord(source.sampleAnswer ?? source.sample ?? ""),
    hints: toLocalizedArray(source.hints ?? source.hint ?? []),
  };
};

const buildSpeakingDraft = (source: Record<string, unknown>): SpeakingDraft => {
  return {
    prompt: toLocalizedRecord(source.prompt ?? source.text ?? ""),
    expectedText: toLocalizedRecord(source.expectedText ?? source.script ?? ""),
  };
};

const extractQuestionsArray = (payload: unknown) => {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    if (Array.isArray(payload.questions)) {
      return payload.questions as unknown[];
    }
    return [payload];
  }
  return [] as unknown[];
};

const resolveLessonPayload = (payload: unknown) => {
  const resolved = resolvePayload(payload);
  if (isRecord(resolved) && "data" in resolved) {
    return (resolved as { data?: unknown }).data ?? resolved;
  }
  return resolved;
};

const isLocalizedValue = (value: unknown): value is { am?: unknown; ao?: unknown } => {
  return isLocalizedRecord(value);
};

const updateLocalizedValue = (current: unknown, lang: "am" | "ao", next: string) => {
  if (isLocalizedRecord(current)) {
    return { ...current, [lang]: next };
  }
  if (typeof current === "string") {
    return next;
  }
  return { am: lang === "am" ? next : "", ao: lang === "ao" ? next : "" };
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
  MODERATION: { label: "Moderation", icon: "🛡️", badge: "bg-rose-50 text-rose-600" },
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
  const [isEditing, setIsEditing] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [dialogueDraft, setDialogueDraft] = useState<DialogueDraft | null>(null);
  const [writingDraft, setWritingDraft] = useState<WritingDraft | null>(null);
  const [speakingDraft, setSpeakingDraft] = useState<SpeakingDraft | null>(null);
  const [questionDraft, setQuestionDraft] = useState<Array<Record<string, unknown>>>([]);
  const [quizDraft, setQuizDraft] = useState<Array<Record<string, unknown>>>([]);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [regeneratingAudioFor, setRegeneratingAudioFor] = useState<{ vocabIndex: number; isExample: boolean; language: "am" | "ao" } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [reports, setReports] = useState<ChatReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ChatReport | null>(null);
  const [isResolvingReport, setIsResolvingReport] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

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

  const fetchContent = useCallback(async () => {
    if (!isAllowed) return;
    setIsLoading(true);
    setError(null);
    try {
      if (contentType === "MODERATION") {
        const res = await getPendingReports();
        setReports(res.data.reports || []);
        setItems([]);
      } else {
        const params = {
          type: contentType === "ALL" ? undefined : contentType,
          topicId: topicId === "ALL" ? undefined : topicId,
        };
        const res = await getPendingContent(params);
        const resolved = resolvePayload(res.data) as ExpertContentItem[] | null;
        setItems(resolved || []);
        setReports([]);
      }
    } catch (err: any) {
      console.error("Fetch content error:", err);
      setError(err.response?.data?.message || "Failed to load content.");
    } finally {
      setIsLoading(false);
    }
  }, [isAllowed, contentType, topicId]);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchTopics();
  }, [fetchTopics, isAllowed]);

  useEffect(() => {
    if (!isAllowed) return;
    void fetchContent();
  }, [fetchContent, isAllowed]);

  const pendingCount = useMemo(() => items.length, [items.length]);

  const showToast = useCallback((type: ToastState["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handlePublish = async (item: ExpertContentItem) => {
    setActionId(item._id);
    setError(null);

    try {
      await verifyContent(item._contentType, item._id);
      await fetchContent();
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
      await fetchContent();
    } catch {
      setError("Failed to reject content. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const handleResolveReport = async (reportId: string, actionTaken: "DISMISS" | "WARN" | "DELETE_MESSAGE" | "FLAG_USER") => {
    setIsResolvingReport(true);
    try {
      await resolveReport(reportId, { actionTaken });
      showToast("success", `Report resolved: ${actionTaken}`);
      setSelectedReport(null);
      void fetchContent();
    } catch (err) {
      console.error("Resolve report error:", err);
      showToast("error", "Failed to resolve report.");
    } finally {
      setIsResolvingReport(false);
    }
  };

  const updateLessonTitle = (lang: "am" | "ao", value: string) => {
    setLessonDraft((prev) =>
      prev ? { ...prev, title: { ...prev.title, [lang]: value } } : prev
    );
  };

  const updateGrammarNotes = (lang: "am" | "ao", value: string) => {
    setLessonDraft((prev) =>
      prev ? { ...prev, grammarNotes: { ...prev.grammarNotes, [lang]: value } } : prev
    );
  };

  const updateVocabularyField = (index: number, lang: "am" | "ao", value: string) => {
    setLessonDraft((prev) => {
      if (!prev) return prev;
      const nextVocabulary = [...prev.vocabulary];
      const current = isRecord(nextVocabulary[index]) ? { ...nextVocabulary[index] } : { am: "", ao: "" };
      nextVocabulary[index] = { ...current, [lang]: value };
      return { ...prev, vocabulary: nextVocabulary };
    });
  };

  const updateDialogueSpeaker = (index: number, value: string) => {
    setLessonDraft((prev) => {
      if (!prev) return prev;
      const nextDialogue = [...prev.dialogue];
      const current = isRecord(nextDialogue[index]) ? { ...nextDialogue[index] } : { speaker: "", text: { am: "", ao: "" } };
      nextDialogue[index] = { ...current, speaker: value };
      return { ...prev, dialogue: nextDialogue };
    });
  };

  const updateDialogueText = (index: number, lang: "am" | "ao", value: string) => {
    setLessonDraft((prev) => {
      if (!prev) return prev;
      const nextDialogue = [...prev.dialogue];
      const current = isRecord(nextDialogue[index]) ? { ...nextDialogue[index] } : { speaker: "", text: { am: "", ao: "" } };
      const currentText = isRecord(current.text) ? { ...current.text } : { am: "", ao: "" };
      nextDialogue[index] = { ...current, text: { ...currentText, [lang]: value } };
      return { ...prev, dialogue: nextDialogue };
    });
  };

  const handleQuizChange = (index: number, nextQuestion: QuestionRecord) => {
    setQuizDraft((prev) => {
      const next = [...prev];
      next[index] = nextQuestion as Record<string, unknown>;
      return next;
    });
  };

  const updateDialogueScenario = (lang: "am" | "ao", value: string) => {
    setDialogueDraft((prev) => (prev ? { ...prev, scenario: { ...prev.scenario, [lang]: value } } : prev));
  };

  const updateDialogueLine = (index: number, field: "speaker" | "am" | "ao", value: string) => {
    setDialogueDraft((prev) => {
      if (!prev) return prev;
      const nextLines = [...prev.lines];
      const current = isRecord(nextLines[index]) ? { ...nextLines[index] } : { characterId: "", content: { am: "", ao: "" } };
      if (field === "speaker") {
        current.characterId = value;
      } else {
        const currentContent = isRecord(current.content) ? { ...current.content } : { am: "", ao: "" };
        current.content = { ...currentContent, [field]: value };
      }
      nextLines[index] = current;
      return { ...prev, lines: nextLines };
    });
  };

  const updateWritingField = (field: "instruction" | "prompt" | "sampleAnswer", lang: "am" | "ao", value: string) => {
    setWritingDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: { ...prev[field], [lang]: value } };
    });
  };

  const updateWritingHint = (index: number, lang: "am" | "ao", value: string) => {
    setWritingDraft((prev) => {
      if (!prev) return prev;
      const nextHints = [...prev.hints];
      nextHints[index] = { ...nextHints[index], [lang]: value };
      return { ...prev, hints: nextHints };
    });
  };

  const updateSpeakingField = (field: "prompt" | "expectedText", lang: "am" | "ao", value: string) => {
    setSpeakingDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: { ...prev[field], [lang]: value } };
    });
  };

  const handleQuestionChange = (index: number, nextQuestion: QuestionRecord) => {
    setQuestionDraft((prev) => {
      const next = [...prev];
      next[index] = nextQuestion as Record<string, unknown>;
      return next;
    });
  };

  const handleSaveDraft = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    try {
      if (selectedItem._contentType === "LESSON" && lessonDraft) {
        await updateLesson(selectedItem._id, {
          title: lessonDraft.title,
          grammarNotes: lessonDraft.grammarNotes,
          vocabulary: lessonDraft.vocabulary,
          dialogue: lessonDraft.dialogue,
          quiz: quizDraft,
        });
      } else if (selectedItem._contentType === "DIALOGUE" && dialogueDraft) {
        await updateExpertContent("DIALOGUE", selectedItem._id, dialogueDraft);
      } else if (selectedItem._contentType === "WRITING" && writingDraft) {
        await updateExpertContent("WRITING", selectedItem._id, writingDraft);
      } else if (selectedItem._contentType === "SPEAKING" && speakingDraft) {
        await updateExpertContent("SPEAKING", selectedItem._id, speakingDraft);
      } else if (selectedItem._contentType === "QUESTION" && questionDraft) {
        // question draft is an array of questions, but for standalone question it might be just the object payload
        const payload = questionDraft.length === 1 ? questionDraft[0] : questionDraft;
        await updateExpertContent("QUESTION", selectedItem._id, payload);
      }

      showToast("success", "Content updated successfully.");
      setIsEditing(false);
      
      // Attempt to locally update the title without reloading the whole queue if possible
      let newTitle = selectedItem._title;
      if (selectedItem._contentType === "LESSON" && lessonDraft) newTitle = lessonDraft.title.am || lessonDraft.title.ao || newTitle;
      if (selectedItem._contentType === "DIALOGUE" && dialogueDraft) newTitle = dialogueDraft.scenario.am || dialogueDraft.scenario.ao || newTitle;
      
      setItems((prev) =>
        prev.map((item) => (item._id === selectedItem._id ? { ...item, _title: newTitle } : item))
      );
    } catch {
      showToast("error", "Failed to update content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedItem?.topicId) {
      showToast("error", "Topic ID is missing for this lesson.");
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const res = await generateQuestions(selectedItem.topicId);
      const resolved = resolvePayload(res.data);
      const generated = Array.isArray(resolved)
        ? resolved
        : Array.isArray((resolved as Record<string, unknown>)?.questions)
          ? ((resolved as Record<string, unknown>).questions as unknown[])
          : [];

      if (generated.length === 0) {
        showToast("error", "No questions were generated.");
        return;
      }

      setQuizDraft((prev) => [...prev, ...generated.map((item) => (isRecord(item) ? { ...item } : { value: item }))]);
      showToast("success", "Questions generated. Review and save to publish.");
    } catch {
      showToast("error", "Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleGenerateLessonAudio = async () => {
    if (!selectedItem?._id) return;
    setIsGeneratingAudio(true);
    try {
      const res = await generateLessonAudio(selectedItem._id);
      showToast("success", "Missing audio generated successfully!");
      
      // Reload lesson to get new audio URLs
      setIsLessonLoading(true);
      const lessonRes = await getLessonById(selectedItem._id);
      const resolved = resolveLessonPayload(lessonRes.data);
      if (isRecord(resolved)) {
        const nextDraft = buildLessonDraft(resolved);
        setLessonDraft(nextDraft);
      }
    } catch (error) {
      showToast("error", "Failed to generate audio. Make sure you haven't hit rate limits.");
    } finally {
      setIsGeneratingAudio(false);
      setIsLessonLoading(false);
    }
  };

  const handleRegenerateAudio = async (vocabIndex: number, isExample: boolean, language: "am" | "ao") => {
    if (!selectedItem?._id) return;
    setRegeneratingAudioFor({ vocabIndex, isExample, language });
    try {
      await regenerateAudio(selectedItem._id, { vocabIndex, isExample, language });
      showToast("success", `Audio regenerated for ${language === 'am' ? 'Amharic' : 'Afaan Oromoo'}`);
      
      // Reload lesson to get new audio URLs
      const lessonRes = await getLessonById(selectedItem._id);
      const resolved = resolveLessonPayload(lessonRes.data);
      if (isRecord(resolved)) {
        const nextDraft = buildLessonDraft(resolved);
        setLessonDraft(nextDraft);
      }
    } catch (error) {
      showToast("error", "Failed to regenerate audio.");
    } finally {
      setRegeneratingAudioFor(null);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => showToast("error", "Could not play audio. Check URL or permissions."));
  };

  const openModal = (item: ExpertContentItem, editMode: boolean = false) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsEditing(editMode);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsEditing(false);
    setLessonDraft(null);
    setDialogueDraft(null);
    setWritingDraft(null);
    setSpeakingDraft(null);
    setQuestionDraft([]);
    setQuizDraft([]);
  };

  useEffect(() => {
    if (!isModalOpen || !selectedItem) {
      return;
    }

    if (selectedItem._contentType !== "LESSON") {
      setLessonDraft(null);
      setQuizDraft([]);
      setIsLessonLoading(false);
      
      const payload = pickDetailPayload(selectedItem, selectedItem._contentType);
      if (selectedItem._contentType === "DIALOGUE") {
        setDialogueDraft(buildDialogueDraft(payload as Record<string, unknown>));
      } else if (selectedItem._contentType === "WRITING") {
        setWritingDraft(buildWritingDraft(payload as Record<string, unknown>));
      } else if (selectedItem._contentType === "SPEAKING") {
        setSpeakingDraft(buildSpeakingDraft(payload as Record<string, unknown>));
      } else if (selectedItem._contentType === "QUESTION") {
        setQuestionDraft(extractQuestionsArray(payload).map(q => isRecord(q) ? { ...q } : { value: q }));
      }
      return;
    }

    const baseDraft = buildLessonDraft(selectedItem as unknown as Record<string, unknown>);
    setLessonDraft(baseDraft);
    setQuizDraft(baseDraft.quiz ?? []);

    const loadLesson = async () => {
      setIsLessonLoading(true);
      try {
        const res = await getLessonById(selectedItem._id);
        const resolved = resolveLessonPayload(res.data);
        if (isRecord(resolved)) {
          const nextDraft = buildLessonDraft(resolved);
          setLessonDraft(nextDraft);
          setQuizDraft(nextDraft.quiz ?? []);
        }
      } catch {
        showToast("error", "Failed to load lesson details. Please try again.");
      } finally {
        setIsLessonLoading(false);
      }
    };

    void loadLesson();
  }, [isModalOpen, selectedItem, showToast]);

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
            <option value="MODERATION">Moderation</option>
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
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : contentType === "MODERATION" ? (
                reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-emerald-600">
                      No pending reports! ✨
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report._id}
                      className="cursor-pointer text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase text-rose-600">
                          🛡️ Report
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-800 line-clamp-1">{report.context || report.reason}</span>
                          <span className="text-[10px] text-slate-400">Reporter: {report.reporterId?.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black uppercase text-amber-700">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-lg">🚩 {report.targetId?.reportCount || 1}</td>
                      <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-black uppercase text-indigo-600 hover:bg-indigo-100"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )
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
                            onClick={(event) => {
                              event.stopPropagation();
                              openModal(item, true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700 transition hover:bg-slate-200"
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
              <div className="flex items-center gap-2">
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase text-slate-600 transition hover:bg-slate-50"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!isEditing || isSaving || isLessonLoading}
                    className="rounded-xl border-b-4 border-emerald-600 bg-emerald-500 px-3 py-2 text-xs font-black uppercase text-white transition hover:translate-y-0.5 hover:border-b-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
              {(() => {
                const payload = pickDetailPayload(selectedItem, selectedItem._contentType);

                if (selectedItem._contentType === "LESSON") {
                  const lessonRecord = (findLessonDetails(payload) ?? (isRecord(payload) ? payload : {})) as Record<string, unknown>;
                  const fallbackDraft = buildLessonDraft(lessonRecord);
                  const lessonData = lessonDraft ?? fallbackDraft;
                  const vocabulary = lessonData.vocabulary;
                  const dialogue = lessonData.dialogue;

                  return (
                    <div className="space-y-4">
                      {isLessonLoading ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Refreshing lesson details...
                        </p>
                      ) : null}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Title</h4>
                        {isEditing ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={lessonData.title.am}
                              onChange={(event) => updateLessonTitle("am", event.target.value)}
                              placeholder="Title (Amharic)"
                            />
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={lessonData.title.ao}
                              onChange={(event) => updateLessonTitle("ao", event.target.value)}
                              placeholder="Title (Afaan Oromoo)"
                            />
                          </div>
                        ) : (
                          <p className="mt-2 text-lg font-bold text-slate-800">
                            {formatLocalized(lessonData.title)}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grammar Notes</h4>
                        {isEditing ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <textarea
                              className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={lessonData.grammarNotes.am}
                              onChange={(event) => updateGrammarNotes("am", event.target.value)}
                              placeholder="Grammar notes (Amharic)"
                            />
                            <textarea
                              className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={lessonData.grammarNotes.ao}
                              onChange={(event) => updateGrammarNotes("ao", event.target.value)}
                              placeholder="Grammar notes (Afaan Oromoo)"
                            />
                          </div>
                        ) : (
                          <p className="mt-2 text-sm font-semibold text-slate-700">
                            {formatLocalized(lessonData.grammarNotes)}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Vocabulary</h4>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={handleGenerateLessonAudio}
                              disabled={isGeneratingAudio || isLessonLoading}
                              className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-black uppercase text-purple-600 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1"
                            >
                              {isGeneratingAudio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                              Generate Missing Audio
                            </button>
                          )}
                        </div>
                        <div className="mt-2 grid gap-2">
                          {vocabulary.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No vocabulary returned.</p>
                          ) : (
                            vocabulary.map((item, index) => {
                              const vItem = item as Record<string, any>;
                              const audioUrl = vItem.audioUrl || {};
                              const exAudioUrl = vItem.example?.audioUrl || {};
                              
                              return (
                                <div
                                  key={`${String(vItem._id ?? index)}`}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                  {isEditing ? (
                                    <div className="space-y-3">
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <div>
                                          <div className="mb-1 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Amharic Word</span>
                                            <div className="flex items-center gap-1">
                                              {audioUrl.am ? (
                                                <>
                                                  <span className="text-[10px] font-bold text-emerald-600">🟢 Audio Ready</span>
                                                  <button onClick={() => playAudio(audioUrl.am)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Play"><Play size={12}/></button>
                                                  <button onClick={() => handleRegenerateAudio(index, false, "am")} disabled={regeneratingAudioFor?.vocabIndex === index} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Regenerate"><RefreshCw size={12} className={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.language === 'am' && !regeneratingAudioFor?.isExample ? "animate-spin" : ""}/></button>
                                                </>
                                              ) : (
                                                <span className="text-[10px] font-bold text-rose-500">🔴 Missing Audio</span>
                                              )}
                                            </div>
                                          </div>
                                          <input
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                            value={typeof vItem.am === "string" ? vItem.am : ""}
                                            onChange={(event) => updateVocabularyField(index, "am", event.target.value)}
                                            placeholder="Amharic"
                                          />
                                        </div>
                                        <div>
                                          <div className="mb-1 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Afaan Oromoo Word</span>
                                            <div className="flex items-center gap-1">
                                              {audioUrl.ao ? (
                                                <>
                                                  <span className="text-[10px] font-bold text-emerald-600">🟢 Audio Ready</span>
                                                  <button onClick={() => playAudio(audioUrl.ao)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Play"><Play size={12}/></button>
                                                  <button onClick={() => handleRegenerateAudio(index, false, "ao")} disabled={regeneratingAudioFor?.vocabIndex === index} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Regenerate"><RefreshCw size={12} className={regeneratingAudioFor?.vocabIndex === index && regeneratingAudioFor?.language === 'ao' && !regeneratingAudioFor?.isExample ? "animate-spin" : ""}/></button>
                                                </>
                                              ) : (
                                                <span className="text-[10px] font-bold text-rose-500">🔴 Missing Audio</span>
                                              )}
                                            </div>
                                          </div>
                                          <input
                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                            value={typeof vItem.ao === "string" ? vItem.ao : ""}
                                            onChange={(event) => updateVocabularyField(index, "ao", event.target.value)}
                                            placeholder="Afaan Oromoo"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-slate-800">
                                        {formatLocalized(isRecord(vItem) ? vItem.word ?? vItem.text ?? vItem.content ?? vItem : vItem)}
                                      </p>
                                      <div className="flex gap-2">
                                        {audioUrl.am && <button onClick={() => playAudio(audioUrl.am)} className="p-1 bg-slate-200 rounded-full text-slate-700 hover:bg-emerald-100"><Play size={12}/></button>}
                                        {audioUrl.ao && <button onClick={() => playAudio(audioUrl.ao)} className="p-1 bg-slate-200 rounded-full text-slate-700 hover:bg-emerald-100"><Play size={12}/></button>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
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
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600"
                                        value={typeof speaker === "string" ? speaker : ""}
                                        onChange={(event) => updateDialogueSpeaker(index, event.target.value)}
                                        placeholder={`Speaker ${index + 1}`}
                                      />
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <textarea
                                          className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                          value={isLocalizedValue(lineText) && typeof lineText.am === "string" ? lineText.am : ""}
                                          onChange={(event) => updateDialogueText(index, "am", event.target.value)}
                                          placeholder="Amharic"
                                        />
                                        <textarea
                                          className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                          value={isLocalizedValue(lineText) && typeof lineText.ao === "string" ? lineText.ao : ""}
                                          onChange={(event) => updateDialogueText(index, "ao", event.target.value)}
                                          placeholder="Afaan Oromoo"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs font-black uppercase text-slate-400">
                                        {typeof speaker === "string" ? speaker : `Line ${index + 1}`}
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-slate-700">
                                        {formatLocalized(lineText)}
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Quiz Questions</h4>
                          {isEditing && quizDraft.length === 0 ? (
                            <button
                              type="button"
                              onClick={handleGenerateQuestions}
                              disabled={isGeneratingQuestions}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
                            </button>
                          ) : null}
                        </div>
                        <div className="mt-2 space-y-3">
                          {quizDraft.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No quiz questions yet.</p>
                          ) : (
                            quizDraft.map((question, index) => (
                              <QuestionEditor
                                key={`${String((question as any)._id ?? index)}`}
                                question={question as QuestionRecord}
                                index={index}
                                isEditing={isEditing}
                                onChange={handleQuizChange}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (selectedItem._contentType === "DIALOGUE") {
                  const fallbackDraft = buildDialogueDraft(payload as Record<string, unknown>);
                  const data = dialogueDraft ?? fallbackDraft;
                  const lines = data.lines;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scenario</h4>
                        {isEditing ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={data.scenario.am}
                              onChange={(e) => updateDialogueScenario("am", e.target.value)}
                              placeholder="Scenario (Amharic)"
                            />
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              value={data.scenario.ao}
                              onChange={(e) => updateDialogueScenario("ao", e.target.value)}
                              placeholder="Scenario (Afaan Oromoo)"
                            />
                          </div>
                        ) : (
                          <p className="mt-2 text-sm font-semibold text-slate-700">
                            {formatLocalized(data.scenario)}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Lines</h4>
                        <div className="mt-2 space-y-2">
                          {lines.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No dialogue lines returned.</p>
                          ) : (
                            lines.map((line, index) => {
                              const record = line as Record<string, unknown>;
                              const content = isRecord(record.content) ? record.content : { am: "", ao: "" };
                              return (
                                <div
                                  key={`${String(record._id ?? index)}`}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                                >
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <input
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black uppercase text-slate-600"
                                        value={typeof record.characterId === "string" ? record.characterId : ""}
                                        onChange={(e) => updateDialogueLine(index, "speaker", e.target.value)}
                                        placeholder="Character / Speaker"
                                      />
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        <input
                                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                          value={typeof content.am === "string" ? content.am : ""}
                                          onChange={(e) => updateDialogueLine(index, "am", e.target.value)}
                                          placeholder="Amharic text"
                                        />
                                        <input
                                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                                          value={typeof content.ao === "string" ? content.ao : ""}
                                          onChange={(e) => updateDialogueLine(index, "ao", e.target.value)}
                                          placeholder="Afaan Oromoo text"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs font-black uppercase text-slate-400">
                                        {typeof record.characterId === "string" ? record.characterId : `Line ${index + 1}`}
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-slate-700">
                                        {formatLocalized(record.content)}
                                      </p>
                                    </>
                                  )}
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
                  const fallbackDraft = buildWritingDraft(payload as Record<string, unknown>);
                  const data = writingDraft ?? fallbackDraft;

                  return (
                    <div className="space-y-4">
                      {["instruction", "prompt", "sampleAnswer"].map((field) => (
                        <div key={field}>
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {field.replace(/([A-Z])/g, " $1")}
                          </h4>
                          {isEditing ? (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <textarea
                                className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                                value={data[field as keyof Omit<WritingDraft, "hints">].am}
                                onChange={(e) => updateWritingField(field as any, "am", e.target.value)}
                                placeholder="Amharic"
                              />
                              <textarea
                                className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                                value={data[field as keyof Omit<WritingDraft, "hints">].ao}
                                onChange={(e) => updateWritingField(field as any, "ao", e.target.value)}
                                placeholder="Afaan Oromoo"
                              />
                            </div>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              {formatLocalized(data[field as keyof Omit<WritingDraft, "hints">])}
                            </p>
                          )}
                        </div>
                      ))}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Hints</h4>
                        <div className="mt-2 space-y-2">
                          {data.hints.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">No hints provided.</p>
                          ) : (
                            data.hints.map((hint, index) => (
                              <div key={index} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                {isEditing ? (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <input
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700"
                                      value={hint.am}
                                      onChange={(e) => updateWritingHint(index, "am", e.target.value)}
                                      placeholder="Hint (Amharic)"
                                    />
                                    <input
                                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700"
                                      value={hint.ao}
                                      onChange={(e) => updateWritingHint(index, "ao", e.target.value)}
                                      placeholder="Hint (Afaan Oromoo)"
                                    />
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-700">{formatLocalized(hint)}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (selectedItem._contentType === "SPEAKING") {
                  const fallbackDraft = buildSpeakingDraft(payload as Record<string, unknown>);
                  const data = speakingDraft ?? fallbackDraft;

                  return (
                    <div className="space-y-4">
                      {["prompt", "expectedText"].map((field) => (
                        <div key={field}>
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            {field.replace(/([A-Z])/g, " $1")}
                          </h4>
                          {isEditing ? (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <textarea
                                className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                                value={data[field as keyof SpeakingDraft].am}
                                onChange={(e) => updateSpeakingField(field as any, "am", e.target.value)}
                                placeholder="Amharic"
                              />
                              <textarea
                                className="min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                                value={data[field as keyof SpeakingDraft].ao}
                                onChange={(e) => updateSpeakingField(field as any, "ao", e.target.value)}
                                placeholder="Afaan Oromoo"
                              />
                            </div>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              {formatLocalized(data[field as keyof SpeakingDraft])}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                const questions = questionDraft.length > 0 ? questionDraft : extractQuestionsArray(payload);

                if (selectedItem._contentType === "QUESTION" && questions.length > 0) {
                  return (
                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <QuestionEditor
                          key={`${String((question as any)._id ?? index)}`}
                          question={question as QuestionRecord}
                          index={index}
                          isEditing={isEditing}
                          onChange={handleQuestionChange}
                        />
                      ))}
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

      {/* Moderation Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Moderate Report</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action required</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)} 
                className="group rounded-full p-2 text-slate-300 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Context Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reported Content</h4>
                <div className="group relative rounded-3xl border-2 border-rose-100 bg-rose-50/20 p-6 transition hover:border-rose-200">
                   <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                     "{selectedReport.context || selectedReport.targetId?.text}"
                   </p>
                   <div className="mt-4 flex items-center justify-between border-t border-rose-100 pt-4">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase">
                       <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                       Reason: {selectedReport.reason}
                     </span>
                     <span className="text-[10px] font-black text-slate-400 uppercase">{formatDate(selectedReport.createdAt)}</span>
                   </div>
                </div>
              </div>

              {/* Resolution Actions */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Resolution</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "DISMISS", label: "Ignore", icon: "✅", color: "slate", emoji: "👍" },
                    { id: "WARN", label: "Warn User", icon: "⚠️", color: "amber", emoji: "🔔" },
                    { id: "DELETE_MESSAGE", label: "Delete", icon: "🗑️", color: "rose", emoji: "✂️" },
                    { id: "FLAG_USER", label: "Flag User", icon: "🚩", color: "indigo", emoji: "🚨" },
                  ].map((act) => (
                    <button 
                      key={act.id}
                      onClick={() => handleResolveReport(selectedReport._id, act.id as any)}
                      disabled={isResolvingReport}
                      className={`flex flex-col items-center gap-3 rounded-[2rem] border-2 border-slate-50 bg-white p-5 transition-all duration-300 hover:border-${act.color}-200 hover:bg-${act.color}-50/50 hover:shadow-xl group active:scale-95`}
                    >
                      <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-125">
                        {act.emoji}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-${act.color}-600`}>
                        {act.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isResolvingReport && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Processing Resolution...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast ? (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-3xl px-8 py-5 shadow-2xl transition-all duration-500 animate-in slide-in-from-right-10 ${
          toast.type === "success" 
            ? "bg-slate-900 text-white" 
            : "bg-rose-600 text-white"
        }`}>
          {toast.type === "success" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
              <XCircle size={20} />
            </div>
          )}
          <span className="text-sm font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}
