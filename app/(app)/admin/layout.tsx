"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { SidebarItem } from "@/components/layout/sidebar-item";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [role, setRole] = useState<string | null>(user?.role ?? null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (user?.role) {
      setRole(user.role);
      setIsCheckingRole(false);
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(typeof payload.role === "string" ? payload.role : null);
      } catch {
        setRole(null);
      }
    }

    setIsCheckingRole(false);
  }, [user?.role]);

  const isAllowed = role === "ADMIN";

  useEffect(() => {
    if (!isCheckingRole && !isAllowed) {
      router.replace("/");
    }
  }, [isCheckingRole, isAllowed, router]);

  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
        Checking admin access...
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-500">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden lg:flex h-full w-[256px] fixed left-0 top-0 px-4 border-r-2 flex-col bg-white">
        <Link href="/admin">
          <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
            <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">Afaan-ልሳን</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Admin Console
              </span>
            </div>
          </div>
        </Link>

        <div className="sidebar-section-label px-4 pt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Admin Tools
        </div>

        <div className="flex flex-col gap-y-2 flex-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <SidebarItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-white">
            <ShieldCheck size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Admin Only</span>
          </div>
        </div>
      </aside>

      <main className="lg:pl-[256px] h-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
