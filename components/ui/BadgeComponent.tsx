import { BookOpen, Compass, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeComponentProps {
  type: "STREAK" | "XP" | "TOPICS";
  level: 1 | 2 | 3 | 4;
  isUnlocked: boolean;
}

const levelStyles = {
  1: {
    shell: "border-amber-700 bg-gradient-to-br from-amber-200 to-amber-500 text-amber-900",
    glow: "",
  },
  2: {
    shell: "border-slate-500 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800",
    glow: "",
  },
  3: {
    shell: "border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-400 text-yellow-900",
    glow: "",
  },
  4: {
    shell: "border-cyan-500 bg-gradient-to-br from-cyan-100 to-cyan-400 text-cyan-900",
    glow: "shadow-[0_0_18px_rgba(34,211,238,0.45)]",
  },
} as const;

export function BadgeComponent({ type, level, isUnlocked }: BadgeComponentProps) {
  const Icon = type === "STREAK" ? Flame : type === "XP" ? BookOpen : Compass;
  const style = levelStyles[level];

  return (
    <div
      className={cn(
        "inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition",
        style.shell,
        style.glow,
        !isUnlocked && "grayscale opacity-40"
      )}
      aria-label={`${type} level ${level} badge`}
    >
      <Icon size={24} strokeWidth={2.5} />
    </div>
  );
}
