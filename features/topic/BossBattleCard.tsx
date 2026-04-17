import Link from "next/link";
import { MessageSquare, PenTool, Lock, Mic, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeStatus } from "./PathNode";

interface BossBattleCardItem {
  _id?: string;
  topicId?: string;
  [key: string]: unknown;
}

interface BossBattleCardProps {
  id: string; // The first dialogue or writing exercise id to link to
  type: "DIALOGUE" | "WRITING" | "SPEAKING" | "TEST";
  items: BossBattleCardItem[];
  status: NodeStatus;
  styleOffset: number;
  label?: string;
}

export const BossBattleCard = ({ id, type, items, status, styleOffset, label }: BossBattleCardProps) => {
  const isLocked = status === "locked";
  const isDialogue = type === "DIALOGUE";
  const isWriting = type === "WRITING";
  const isSpeaking = type === "SPEAKING";
  const Icon = isDialogue ? MessageSquare : isWriting ? PenTool : isSpeaking ? Mic : Trophy;
  const dialogueTopicId = items?.[0]?.topicId || id;
  const writingTopicId = items?.[0]?.topicId;
  const speakingTopicId = items?.[0]?.topicId;
  const testTopicId = items?.[0]?.topicId || id;
  const dialogueId = items?.[0]?._id;
  const href = isDialogue
    ? dialogueId
      ? `/dialogue/${dialogueTopicId}?dialogueId=${dialogueId}`
      : `/dialogue/${dialogueTopicId}`
    : isWriting
      ? writingTopicId
        ? `/writing/${id}?topicId=${writingTopicId}`
        : `/writing/${id}`
      : isSpeaking
        ? speakingTopicId
          ? `/speaking/${id}?topicId=${speakingTopicId}`
          : `/speaking/${id}`
        : `/test/${testTopicId}`;

  const content = (
    <div
      className={cn(
        "relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all z-10",
        isLocked
          ? "bg-[#e5e5e5] border-b-8 border-[#cecece] text-[#afafaf] cursor-not-allowed"
          : isDialogue
            ? "bg-purple-500 border-b-8 border-purple-700 text-white shadow-xl active:border-b-0 active:translate-y-2"
            : isWriting
              ? "bg-orange-500 border-b-8 border-orange-700 text-white shadow-xl active:border-b-0 active:translate-y-2"
              : isSpeaking
                ? "bg-sky-500 border-b-8 border-sky-700 text-white shadow-xl active:border-b-0 active:translate-y-2"
                : "bg-yellow-400 border-b-8 border-yellow-600 text-white shadow-xl active:border-b-0 active:translate-y-2"
      )}
    >
      {isLocked ? <Lock size={36} strokeWidth={2.5} /> : <Icon size={40} strokeWidth={2.5} />}
      
      {/* Optional tiny badge showing count */}
      {!isLocked && items.length > 1 && (
        <div className="absolute -top-2 -right-2 bg-white text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-200">
          {items.length}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative flex flex-col items-center justify-center my-4 z-10"
      style={{
        transform: `translateX(${styleOffset}px)`,
      }}
    >
      {isLocked ? (
        content
      ) : (
        <Link href={href} className="block outline-none">
          {content}
        </Link>
      )}

      {label ? <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{label}</p> : null}
    </div>
  );
};
