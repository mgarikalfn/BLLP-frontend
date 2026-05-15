"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  Sparkles, 
  UserCircle2, 
  Users, 
  Settings,
  Youtube,
  ShieldAlert,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import Image from "next/image";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/api/dashboard.api";

type Props = {
  className?: string;
};

export default function Sidebar({ className }: Props) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toUpperCase();

  // Don't render until role is determined to prevent learner flash
  if (!role) return null;

  return <SidebarInner className={className} role={role} pathname={pathname} isMoreOpen={isMoreOpen} setIsMoreOpen={setIsMoreOpen} />;
}

function SidebarInner({ className, role, pathname, isMoreOpen, setIsMoreOpen }: {
  className?: string;
  role: string;
  pathname: string | null;
  isMoreOpen: boolean;
  setIsMoreOpen: (v: boolean) => void;
}) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const { data: dashboardData } = useQuery({ 
    queryKey: ["dashboard"], 
    queryFn: getDashboard,
    enabled: role === "LEARNER",
  });
  const currentLevel = dashboardData?.user?.proficiencyLevel?.toLowerCase() || "beginner";

  useEffect(() => {
    if (role === "LEARNER") {
      void fetchNotifications();
    }
  }, [fetchNotifications, role]);

  const renderContent = () => {
    if (role === "ADMIN") {
      return (
        <>
          <div className="sidebar-section-label px-4 pt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Admin Panel
          </div>
          <SidebarItem href="/admin" icon={LayoutDashboard} label="Admin Dashboard" />
          <SidebarItem href="/admin/users" icon={Users} label="User Management" />
          <SidebarItem href="/admin/moderation" icon={ShieldAlert} label="Moderation" />
          <SidebarItem href="/admin/settings" icon={Settings} label="Admin Settings" />
          <hr className="my-2 border-slate-200" />
          <div className="sidebar-section-label px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Authoring
          </div>
          <SidebarItem href="/expert" icon={Sparkles} label="Expert Tools" />
        </>
      );
    }

    if (role === "EXPERT") {
      return (
        <>
          <div className="sidebar-section-label px-4 pt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Authoring Tools
          </div>
          <SidebarItem href="/expert" icon={LayoutDashboard} label="Expert Dashboard" />
          <SidebarItem href="/expert/review" icon={ClipboardCheck} label="Review Queue" />
          <SidebarItem href="/expert/generate" icon={Sparkles} label="Generate Content" />
          <SidebarItem href="/expert/videos/discover" icon={Youtube} label="Discover Videos" />
          <hr className="my-2 border-slate-200" />
          <SidebarItem href="/settings" icon={Settings} label="Settings" />
        </>
      );
    }

    // Default to Learner
    return (
      <>
        <div className="flex-1 overflow-hidden flex flex-col gap-y-1">
          <SidebarItem label="Dashboard" href="/dashboard" iconSrc="/learn.svg" />
          <SidebarItem label="Learn" href="/topics" iconSrc="/learnn.jpg" />
          <SidebarItem label="Leaderboard" href="/leaderboard" iconSrc="/trophy.png" />
          <SidebarItem label="Study" href="/study" iconSrc="/reading.png" />
          <SidebarItem label="Quests" href="/quests" iconSrc="/quests.png" />
          <SidebarItem label="Shop" href="/shop" iconSrc="/shop.png" />
          <SidebarItem label="Chat" href="/chat" iconSrc="/chat.png" />
        </div>
        
        {/* More Button - styled like other sidebar items */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="w-full h-13 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition font-semibold text-sm flex items-center justify-between gap-3 mb-2"
        >
          <div className="flex items-center gap-3">
             <span className="text-lg ml-1">⋯</span>
             <span className="ml-5">More</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-400", isMoreOpen && "rotate-180")} />
        </button>

        {/* Inline More Items */}
        {isMoreOpen && (
          <div className="flex flex-col gap-y-1 mb-4 border-l-4 border-slate-100 ml-4 pl-2 animate-in slide-in-from-top-2 duration-200 fade-in">
            <SidebarItem href="/activity" label="Activity" iconSrc="/activity.png" showIndicator={unreadCount > 0} />
            <SidebarItem href={`/certification/${currentLevel}`} label="Certification" iconSrc="/certification.png" />
            <SidebarItem href="/settings" label="Settings" icon={Settings} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col bg-white z-50",
      className,
    )}>
      <Link href="/">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Afaan-ልሳን
          </h1>
        </div>
      </Link>

      <div className="flex flex-col gap-y-1 flex-1 overflow-y-auto overflow-x-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

