import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils"; // Utility for merging tailwind classes

type NodeStatus = "completed" | "current" | "locked";

interface PathNodeProps {
  id: string;
  order: number;
  status: NodeStatus;
  styleOffset: number; // For the zig-zag effect
}

export const PathNode = ({ id, status, styleOffset }: PathNodeProps) => {
  const isLocked = status === "locked";
  
  // Style Mapping
  const styles = {
    completed: "bg-green-500 border-green-700 text-white shadow-[0_4px_0_0_#15803d]",
    current: "bg-blue-500 border-blue-700 text-white shadow-[0_4px_0_0_#1d4ed8] animate-bounce-subtle",
    locked: "bg-gray-200 border-gray-400 text-gray-400 shadow-[0_4px_0_0_#9ca3af]",
  };

  const content = (
    <div
      style={{ marginLeft: `${styleOffset}px` }}
      className={cn(
        "relative w-20 h-20 rounded-full border-b-4 flex items-center justify-center transition-all active:mt-1 active:border-b-0",
        styles[status],
        isLocked && "cursor-not-allowed"
      )}
    >
      {status === "completed" && <Check className="w-8 h-8 stroke-3" />}
      {status === "current" && <div className="w-4 h-4 bg-white rounded-full" />}
      {status === "locked" && <Lock className="w-6 h-6" />}
    </div>
  );

  if (isLocked) return content;

  return (
    <Link href={`/lessons/${id}`} className="block">
      {content}
    </Link>
  );
};