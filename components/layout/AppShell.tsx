"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { DictionaryDrawer } from "@/features/ai/DictionaryDrawer";
import { TutorChat } from "@/features/ai/TutorChat";
import { HeartRefillModal } from "@/components/modals/HeartRefillModal";
import { useAuthStore } from "@/store/authStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toUpperCase();
  const isLearner = role === "LEARNER" || !role;

  const isAdminRoute = pathname?.startsWith("/admin");
  const isFocusRoute = pathname?.startsWith("/certification") || pathname?.startsWith("/certificate");

  if (isAdminRoute || isFocusRoute) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <>
      <Sidebar className="hidden lg:flex" />
      <TopNavbar />
      <main className="lg:pl-64 h-full pt-16">
        <div>{children}</div>
      </main>
      {isLearner && (
        <>
          <DictionaryDrawer />
          <TutorChat />
          <HeartRefillModal />
        </>
      )}
    </>
  );
}