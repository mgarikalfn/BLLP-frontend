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
  const currentLevel = dashboardData?.actions?.recommendedLesson?.topic?.level?.toLowerCase() || "beginner";

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
          className="w-full h-13 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition font-semibold text-sm flex items-center justify-start gap-3 mb-2"
        >
          <span className="text-lg">⋯</span>
          <span>More</span>
        </button>
      </>
    );
  };

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col bg-white relative",
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

      <div className="flex flex-col gap-y-1 flex-1  relative">
        {renderContent()}

        {/* More Menu Overlay - appears within sidebar bounds */}
        {isMoreOpen && (
          <div 
            className="absolute top-60 left-[105%]  w-68 h-fit max-h-[300px] bg-white rounded-lg shadow-lg p-4 flex flex-col gap-2 z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-black text-slate-900 mb-1 px-2">More</h2>
            
            <Link 
              href="/activity" 
              className="px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-slate-700 font-semibold text-sm flex items-center gap-3"
              onClick={() => setIsMoreOpen(false)}
            >
              <Image src="/activity.png" alt="Activity" height={20} width={20} unoptimized />
              Activity
              {unreadCount > 0 && <span className="ml-auto h-2 w-2 rounded-full bg-rose-500" />}
            </Link>
            
            <Link 
              href={`/certification/${currentLevel}`} 
              className="px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-slate-700 font-semibold text-sm flex items-center gap-3"
              onClick={() => setIsMoreOpen(false)}
            >
              <Image src="/certificate.png" alt="Certification" height={20} width={20} unoptimized />
              Certification
            </Link>
            
            <Link 
              href="/settings" 
              className="px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-slate-700 font-semibold text-sm flex items-center gap-3"
              onClick={() => setIsMoreOpen(false)}
            >
              <UserCircle2 size={20} className="text-slate-700" />
              Settings
            </Link>
          </div>
        )}
      </div>

      {/* Backdrop - only visible when More menu is open */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20" 
          onClick={() => setIsMoreOpen(false)}
        />
      )}
    </div>
  );
}

