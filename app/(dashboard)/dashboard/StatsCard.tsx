// components/dashboard/StatsCard.tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export function StatsCard({ title, value, icon, variant = 'primary' }: StatsCardProps) {
  const variants = {
    primary: "bg-[#58cc02] border-[#46a302]",
    secondary: "bg-[#1cb0f6] border-[#1899d6]",
    danger: "bg-[#ff4b4b] border-[#d33131]",
    warning: "bg-[#ff9600] border-[#cc7a00]",
  };

  return (
    <div className="border-2 border-[#e5e5e5] rounded-2xl p-4 flex items-center gap-4 bg-white">
      <div className={cn("p-2 rounded-xl border-b-4 text-white", variants[variant])}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-[#afafaf] uppercase tracking-widest leading-none mb-1">
          {title}
        </p>
        <p className="text-xl font-black text-[#4b4b4b] leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}