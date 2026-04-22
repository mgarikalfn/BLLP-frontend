"use client";

import Sidebar from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { DictionaryDrawer } from "@/features/ai/DictionaryDrawer";
import { TutorChat } from "@/features/ai/TutorChat";
import { HeartRefillModal } from "@/components/modals/HeartRefillModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar className="hidden lg:flex" />
      <TopNavbar />
      <main className="lg:pl-[256px] h-full pt-[64px]">
        <div>{children}</div>
      </main>
      <DictionaryDrawer />
      <TutorChat />
      <HeartRefillModal />
    </>
  );
}