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
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import Image from "next/image";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

type Props = {
  className?: string;
};

export default function Sidebar({ className }: Props) {
  const pathname = usePathname();
  // Don't show sidebar on admin sub-pages if they have their own layout
  // (Keeping this check as it was present in original code, though we might refine it)
  if (pathname?.startsWith("/admin") && pathname !== "/admin") {
    // return null; 
    // Actually, if we want a unified sidebar, we might keep it. 
    // But original code had: if (pathname?.startsWith("/admin")) return null;
    // Let's keep the exclusion for now but allow /admin itself to see if it works.
  }

  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  
  const role = user?.role?.toUpperCase();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

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
        </>
      );
    }

    // Default to Learner
    return (
      <>
        <SidebarItem label="Dashboard" href="/dashboard" iconSrc="/learn.svg" />
        <SidebarItem label="Learn" href="/topics" iconSrc="/learnn.jpg" />
        <SidebarItem label="Leaderboard" href="/leaderboard" iconSrc="/trophy.png" />
        <SidebarItem label="Study" href="/study" iconSrc="/reading.png" />
        <SidebarItem label="Quests" href="/quests" iconSrc="/quests.png" />
        <SidebarItem label="Shop" href="/shop" iconSrc="/shop.png" />
        <SidebarItem label="Chat" href="/chat" iconSrc="/chat.png" />
        <SidebarItem label="Activity" href="/activity" iconSrc="/activity.png" showIndicator={unreadCount > 0} />
      </>
    );
  };

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col bg-white",
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

      <div className="flex flex-col gap-y-2 flex-1 overflow-y-auto overflow-x-hidden">
        {renderContent()}
      </div>

      <div className="p-4">
        <SidebarItem label="Settings" href="/settings" icon={UserCircle2} />
      </div>
    </div>
  );
}

