import { MessageSquare, PenTool, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BossBattleCardProps {
  type: "DIALOGUE" | "WRITING";
  items: any[]; // These would be your Dialogue[] or WritingExercise[]
  unlocked: boolean;
}

export const BossBattleCard = ({ type, items, unlocked }: BossBattleCardProps) => {
  const isDialogue = type === "DIALOGUE";
  
  // Dynamic styling based on status
  const containerStyles = unlocked
    ? isDialogue 
      ? "bg-purple-100 border-purple-300 text-purple-700 shadow-[0_4px_0_0_#d8b4fe]" 
      : "bg-orange-100 border-orange-300 text-orange-700 shadow-[0_4px_0_0_#fdba74]"
    : "bg-gray-50 border-gray-200 text-gray-400 shadow-none grayscale";

  const Icon = isDialogue ? MessageSquare : PenTool;

  return (
    <div className={cn(
      "relative w-full p-6 rounded-2xl border-2 transition-all cursor-pointer group mb-4",
      containerStyles,
      unlocked && "active:translate-y-1 active:shadow-none"
    )}>
      <div className="flex items-center gap-5">
        {/* Icon Circle */}
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center border-2",
          unlocked 
            ? isDialogue ? "bg-purple-500 border-purple-600 text-white" : "bg-orange-500 border-orange-600 text-white"
            : "bg-gray-200 border-gray-300 text-gray-400"
        )}>
          {unlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="font-black text-xl uppercase tracking-tight">
            {isDialogue ? "Dialogue Practice" : "Writing Challenge"}
          </h3>
          <p className="text-sm font-bold opacity-80">
            {unlocked 
              ? `${items.length} Activities Unlocked` 
              : "Complete all lessons to unlock"}
          </p>
        </div>
      </div>

      {/* Subtle "Go" Arrow for unlocked state */}
      {unlocked && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-black text-2xl">→</span>
        </div>
      )}
    </div>
  );
};