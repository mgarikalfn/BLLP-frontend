import { create } from "zustand";
import { api } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import type { LearningDirection } from "@/types/ProfileData";

export type ChatRole = "user" | "model";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleChat: () => void;
  clearChat: () => void;
  sendMessage: (text: string, topicId?: string) => Promise<void>;
}

interface ChatResponse {
  data?: {
    reply?: string;
    response?: string;
    message?: string;
    text?: string;
    content?: string;
  };
  reply?: string;
  response?: string;
  message?: string;
  text?: string;
  content?: string;
}

const resolveLearningDirection = (): LearningDirection => {
  const languageState = useLanguageStore.getState();
  if (languageState.learningDirection) return languageState.learningDirection;
  return languageState.lang === "am" ? "AM_TO_OR" : "OR_TO_AM";
};

const extractModelReply = (payload: ChatResponse): string => {
  const nested = payload.data;
  return (
    nested?.reply ||
    nested?.response ||
    nested?.message ||
    nested?.text ||
    nested?.content ||
    payload.reply ||
    payload.response ||
    payload.message ||
    payload.text ||
    payload.content ||
    ""
  ).trim();
};

const postChat = async (payload: {
  messages: ChatMessage[];
  topicId?: string;
  learningDirection: LearningDirection;
}) => {
  try {
    return await api.post<ChatResponse>("/api/ai/chat", payload);
  } catch (error: unknown) {
    const status =
      typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 404) {
      return api.post<ChatResponse>("/ai/chat", payload);
    }

    throw error;
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  clearChat: () => set({ messages: [], isLoading: false }),

  sendMessage: async (text, topicId) => {
    const trimmed = text.trim();
    if (!trimmed || get().isLoading) return;

    const learningDirection = resolveLearningDirection();
    const optimisticUserMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...get().messages, optimisticUserMessage];

    set({ messages: updatedMessages, isLoading: true });

    try {
      const response = await postChat({
        messages: updatedMessages,
        topicId: topicId || undefined,
        learningDirection,
      });

      const reply = extractModelReply(response.data);
      if (!reply) {
        set({ isLoading: false });
        return;
      }

      set((state) => ({
        messages: [...state.messages, { role: "model", content: reply }],
        isLoading: false,
      }));
    } catch (error: unknown) {
      const fallbackMessage: ChatMessage = {
        role: "model",
        content:
          typeof error === "object" && error !== null && "response" in error
            ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ||
              "Tutor is unavailable right now. Please try again.")
            : "Tutor is unavailable right now. Please try again.",
      };

      set((state) => ({
        messages: [...state.messages, fallbackMessage],
        isLoading: false,
      }));
    }
  },
}));
