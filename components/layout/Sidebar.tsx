"use client";

import Link from "next/link";
import { Bell, Brain, ShoppingCart, Target, Trophy, UserCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import Image from "next/image";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";




type Props = {
  className?: string;
};

export default function  Sidebar  ({ className }: Props)  {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

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
