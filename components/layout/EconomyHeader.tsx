"use client";

import { useEffect } from "react";
import { Flame, Gem, Heart } from "lucide-react";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useDashboard } from "@/hooks/useDashboard";

const Pill = ({
  icon,
  value,
  className,
}: {
  icon: React.ReactNode;
  value: number;
  className: string;
}) => {
  return (
    <div
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-black uppercase tracking-wider shadow-sm ${className}`}
    >
      {icon}
      <span>{value}</span>
    </div>
  );
};

export function EconomyHeader() {
  const gems = useEconomyStore((state) => state.gems);
  const hearts = useEconomyStore((state) => state.hearts);
  const fetchEconomyStatus = useEconomyStore((state) => state.fetchEconomyStatus);

  const { data } = useDashboard();
  const streak = data?.user?.streak ?? 0;

  useEffect(() => {
    void fetchEconomyStatus();
  }, [fetchEconomyStatus]);

  return (
    <div className="hidden lg:flex fixed top-4 right-6 z-[62] items-center gap-2">
      <Pill
        icon={<Flame size={16} className="text-orange-500" />}
        value={streak}
        className="border-orange-200 bg-white text-orange-700"
      />
      <Pill
        icon={<Gem size={16} className="text-sky-500" />}
        value={gems}
        className="border-sky-200 bg-white text-sky-700"
      />
      <Pill
        icon={<Heart size={16} className={hearts > 0 ? "text-rose-500" : "text-rose-300"} />}
        value={hearts}
        className={hearts > 0 ? "border-rose-200 bg-white text-rose-700" : "border-rose-100 bg-rose-50 text-rose-400"}
      />
    </div>
  );
}
