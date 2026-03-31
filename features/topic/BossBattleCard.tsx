import Link from "next/link";
import { MessageSquare, PenTool, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { NodeStatus } from "./PathNode";

interface BossBattleCardProps {
  id: string; // The first dialogue or writing exercise id to link to
  type: "DIALOGUE" | "WRITING";
  items: any[];
  status: NodeStatus;
  styleOffset: number;
}

export const BossBattleCard = ({ id, type, items, status, styleOffset }: BossBattleCardProps) => {
  const isLocked = status === "locked";
  const isDialogue = type === "DIALOGUE";
  const Icon = isDialogue ? MessageSquare : PenTool;

  const content = (
    <div
      className={cn(
        "relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all z-10",
        isLocked
          ? "bg-[#e5e5e5] border-b-[8px] border-[#cecece] text-[#afafaf] cursor-not-allowed"
          : isDialogue
            ? "bg-purple-500 border-b-[8px] border-purple-700 text-white shadow-xl active:border-b-0 active:translate-y-[8px]"
            : "bg-orange-500 border-b-[8px] border-orange-700 text-white shadow-xl active:border-b-0 active:translate-y-[8px]"
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
        <Link href={`/${type.toLowerCase()}/${id}`} className="block outline-none">
          {content}
        </Link>
      )}
    </div>
  );
};
