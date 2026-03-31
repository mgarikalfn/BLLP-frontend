import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeStatus = "completed" | "active" | "locked";

interface PathNodeProps {
  id: string;
  order: number;
  status: NodeStatus;
  styleOffset: number; // For the zig-zag effect
}

export const PathNode = ({ id, order, status, styleOffset }: PathNodeProps) => {
  const isLocked = status === "locked";
  const isActive = status === "active";
  const isCompleted = status === "completed";

  return (
    <div
      className="relative flex flex-col items-center justify-center z-10"
      style={{
        transform: `translateX(${styleOffset}px)`,
      }}
    >
      {/* Floating Tooltip for Active Node */}
      {isActive && (
        <div className="absolute -top-16 z-20 animate-bounce">
          <div className="bg-white border-2 border-gray-200 text-green-500 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm">
            Start
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 rotate-45" />
        </div>
      )}

      {isLocked ? (
        <div
          className={cn(
            "relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all",
            "bg-[#e5e5e5] border-b-[8px] border-[#cecece] text-[#afafaf] cursor-not-allowed my-2"
          )}
        >
          <Lock size={32} strokeWidth={2.5} />
        </div>
      ) : (
        <Link href={`/lessons/${id}`} className="block my-2 group outline-none">
          <div
            className={cn(
              "relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all",
              "border-b-[8px] active:border-b-0 active:translate-y-[8px]",
              isCompleted
                ? "bg-yellow-400 border-yellow-500 text-white"
                : "bg-green-500 border-green-600 text-white shadow-xl"
            )}
          >
            {isCompleted ? (
              <Check size={36} strokeWidth={4} />
            ) : (
              <Star size={36} strokeWidth={3} fill="currentColor" />
            )}
          </div>
        </Link>
      )}
    </div>
  );
};
