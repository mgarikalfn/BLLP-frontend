"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { Bot, SendHorizonal, Sparkles, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useLanguageStore } from "@/store/languageStore";
import type { LearningDirection } from "@/types/ProfileData";
import { usePathname } from "next/navigation";

type NativeLanguage = "am" | "ao";

const resolveNativeLanguage = (learningDirection: LearningDirection | null, fallback: NativeLanguage): NativeLanguage => {
  if (learningDirection === "AM_TO_OR") return "am";
  if (learningDirection === "OR_TO_AM") return "ao";
  return fallback;
};

const extractTopicIdFromPathname = (pathname: string): string | undefined => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return undefined;

  const first = segments[0];
  const second = segments[1];
  if (["topics", "dialogue", "test", "writing", "speaking", "lessons"].includes(first)) {
    return second;
  }

  return undefined;
};

export function TutorChat() {
  const pathname = usePathname();
  const topicId = extractTopicIdFromPathname(pathname);

  const isOpen = useChatStore((state) => state.isOpen);
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const toggleChat = useChatStore((state) => state.toggleChat);
  const clearChat = useChatStore((state) => state.clearChat);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const learningDirection = useLanguageStore((state) => state.learningDirection);
  const fallbackNativeLanguage = useLanguageStore((state) => state.lang);
  const nativeLanguage = resolveNativeLanguage(learningDirection, fallbackNativeLanguage);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const text = {
    title: "Afaan-ልሳን AI Tutor",
    placeholder: nativeLanguage === "am" ? "ጥያቄዎን ይጻፉ..." : "Gaaffii kee barreessi...",
    clear: nativeLanguage === "am" ? "ውይይቱን አጥፋ" : "Mari'ii qulqulleessi",
    close: nativeLanguage === "am" ? "ዝጋ" : "Cufi",
    typing: nativeLanguage === "am" ? "AI እያሰበ ነው..." : "AI yaadaa jira...",
    openChat: nativeLanguage === "am" ? "AI አስተማሪን ክፈት" : "AI barsiisaa bani",
  };

  const suggestions = useMemo(() => {
    if (nativeLanguage === "am") {
      return ["ይህን ትምህርት አስረዳኝ", "እንለማመድ", "ስህተቴን አርምልኝ"];
    }

    return ["Barnoota kana naaf ibsi", "Mee haa shaakallu", "Dogoggora koo naaf sirreessi"];
  }, [nativeLanguage]);

  const autoResizeInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
    await sendMessage(message, topicId);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion, topicId);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  const handleInputKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        className="fixed bottom-6 right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#2563eb_0%,#7c3aed_100%)] text-white shadow-[0_16px_35px_rgba(59,130,246,0.35)] transition hover:scale-105 hover:shadow-[0_18px_40px_rgba(124,58,237,0.38)] md:right-6"
        aria-label={text.openChat}
      >
        <Sparkles size={22} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-[65] bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={toggleChat}
      />

      <aside
        className={cn(
          "fixed z-[68] flex flex-col border border-white/40 bg-white/85 shadow-[0_28px_60px_rgba(15,23,42,0.26)] backdrop-blur-xl transition-transform duration-300 ease-out",
          "inset-x-0 bottom-0 h-[78vh] rounded-t-3xl",
          "md:inset-y-5 md:right-6 md:left-auto md:h-auto md:w-[430px] md:rounded-3xl",
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-[120%]"
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-slate-100/80 via-sky-100/60 to-indigo-100/70 px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Bot size={18} />
            </div>
            <h2 className="text-sm font-black tracking-wide text-slate-800">{text.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-slate-900"
              aria-label={text.clear}
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={toggleChat}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-slate-900"
              aria-label={text.close}
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5">
          {messages.length === 0 ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quick prompts</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      void handleSuggestionClick(suggestion);
                    }}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
              className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed",
                  message.role === "user"
                    ? "bg-[linear-gradient(135deg,#2563eb_0%,#7c3aed_100%)] text-white shadow-md"
                    : "bg-white text-slate-800 shadow-[0_6px_18px_rgba(15,23,42,0.10)]"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex items-center gap-2 px-1 pt-1 text-sm font-semibold text-slate-500">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </div>
              {text.typing}
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-200/80 bg-white/75 p-3 md:p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                autoResizeInput();
              }}
              onKeyDown={(event) => {
                void handleInputKeyDown(event);
              }}
              placeholder={text.placeholder}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={isLoading || input.trim().length === 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
