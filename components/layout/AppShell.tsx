"use client";

import MobileHeader from "./mobile-header";
import Sidebar from "./Sidebar";
import { DictionaryDrawer } from "@/features/ai/DictionaryDrawer";
import { TutorChat } from "@/features/ai/TutorChat";

export default function AppShell({ children }: { children: React.ReactNode }) {

  return (
    <>
    <MobileHeader/>
      <Sidebar className="hidden lg:flex"/>
      <main className="lg:pl-64 h-full pt-12.5 lg:pt-0">
        <div>
          {children}
        </div>
      </main>
      <DictionaryDrawer />
      <TutorChat />
    </>
  );
}