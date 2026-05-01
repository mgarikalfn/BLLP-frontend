"use client";

import Link from "next/link";
import { Bell, Brain, ClipboardCheck, LayoutDashboard, MessageCircle, ShoppingCart, Sparkles, Target, Trophy, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import Image from "next/image";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";




type Props = {
  className?: string;
};

export default function  Sidebar  ({ className }: Props)  {
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const [role, setRole] = useState<string | null>(user?.role ?? null);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setRole(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(typeof payload.role === "string" ? payload.role : null);
    } catch {
      setRole(null);
    }
  }, [user?.role]);

  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
      className,
    )}>
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Lingo
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        {(role === "EXPERT" || role === "ADMIN") && (
          <>
            <div className="sidebar-section-label px-4 pt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Expert Tools
            </div>
            <SidebarItem href="/expert" icon={LayoutDashboard} label="Expert Dashboard" />
            <SidebarItem href="/expert/review" icon={ClipboardCheck} label="Review Queue" />
            <SidebarItem href="/expert/generate" icon={Sparkles} label="Generate Content" />
            <hr className="sidebar-divider my-2 border-slate-200" />
          </>
        )}
         <SidebarItem
          label="Dashboard"
          href="/dashboard"
          iconSrc="/learn.svg"
        />

         <SidebarItem
          label="learn"
          href="/topics"
          iconSrc="/learnn.jpg"
        />

        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconSrc="/trophy.png"
        />

        <SidebarItem
          label="Study"
          href="/study"
          iconSrc="/reading.png"
        />

        <SidebarItem
          label="Quests"
          href="/quests"
          iconSrc="/quests.png"
        />

        <SidebarItem
          label="Shop"
          href="/shop"
          iconSrc="/shop.png"
        />

        <SidebarItem
          label="Chat"
          href="/chat"
          iconSrc="/chat.png"
        />

        <SidebarItem
          label="ACTIVITY"
          href="/activity"
          iconSrc="/activity.png"
          showIndicator={unreadCount > 0}
        />
       
        {/* <SidebarItem 
          label="Learn" 
          href="/learn"
          iconSrc="/learn.svg"
        />c:\Users\hp\Downloads\idea.png
        <SidebarItem 
          label="Leaderboard" 
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        /> */}
       {/*  <SidebarItem 
          label="shop" 
          href="/shop"
          iconSrc="/shop.svg"
        /> */}
       

      </div>
      <div className="p-4">
        <SidebarItem
          label="Profile"
          href="/profile"
          icon={UserCircle2}
        />
      </div>
    </div>
  );
};
