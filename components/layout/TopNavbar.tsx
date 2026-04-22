"use client";

import { useEffect } from "react";
import { Flame, Gem, Heart, Star } from "lucide-react";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useDashboard } from "@/hooks/useDashboard";
import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

const Pill = ({
  icon,
  value,
  className,
  tooltip,
}: {
  icon: React.ReactNode;
  value: number;
  className: string;
  tooltip?: string;
}) => {
  return (
    <div
      title={tooltip}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border px-3 text-sm font-black tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
    >
      {icon}
      <span>{value}</span>
    </div>
  );
};

export function TopNavbar() {
  const gems = useEconomyStore((state) => state.gems);
  const hearts = useEconomyStore((state) => state.hearts);
  const fetchEconomyStatus = useEconomyStore((state) => state.fetchEconomyStatus);

  const { data } = useDashboard();
  const streak = data?.user?.streak ?? 0;
  const xp = data?.user?.xp ?? 0;
  const tier = data?.user?.tier ?? "Bronze";

  useEffect(() => {
    void fetchEconomyStatus();
  }, [fetchEconomyStatus]);

  return (
    <nav className="fixed top-0 left-0 lg:left-[256px] right-0 z-50 flex h-16 items-center justify-between border-b-2 border-slate-200 bg-white/80 px-4 backdrop-blur-md shadow-sm">
      {/* Left side: Hamburger on mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar />
      </div>

      {/* Center/Left: Game Economy Metrics */}
      <div className="flex flex-1 items-center justify-center lg:justify-start gap-2 sm:gap-4">
        <Pill
          icon={<Flame size={20} className="text-orange-500" fill="#f97316" />}
          value={streak}
          className="border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"
          tooltip="Daily Streak"
        />
        <Pill
          icon={<Gem size={20} className="text-sky-500" fill="#0ea5e9" />}
          value={gems}
          className="border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100"
          tooltip="Gems"
        />
        <Pill
          icon={
            <Heart
              size={20}
              className={hearts > 0 ? "text-rose-500" : "text-rose-300"}
              fill={hearts > 0 ? "#f43f5e" : "transparent"}
            />
          }
          value={hearts}
          className={
            hearts > 0
              ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-rose-200 bg-slate-50 text-rose-400 opacity-80"
          }
          tooltip="Hearts"
        />
      </div>

      {/* Right side: XP, User Profile & Notifications */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2" title="Total XP">
          <Star size={24} className="text-amber-400" fill="#fbbf24" />
          <span className="text-base font-black text-amber-500">{xp} XP</span>
        </div>

        <NotificationBell />

        <div className="hidden sm:flex items-center gap-3 pl-2 border-l-2 border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">{tier} League</span>
          </div>
          <div className="h-10 w-10 cursor-pointer rounded-full border-b-4 border-indigo-700 bg-indigo-500 hover:bg-indigo-400 transition" />
        </div>
      </div>
    </nav>
  );
}
