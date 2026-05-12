"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function BannedPage() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Attempt local logout if state is still around
    void logout();
  }, [logout]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-slate-900 p-8 shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-500">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 ring-8 ring-rose-500/5">
          <ShieldAlert size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-100 uppercase tracking-wide">Account Suspended</h1>
          <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            Your account has been permanently suspended for violating our Community Guidelines.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 mt-4">
          <Link 
            href="/login"
            className="flex w-full items-center justify-center rounded-2xl bg-rose-500 px-4 py-3.5 text-sm font-black text-white hover:bg-rose-600 transition"
          >
            Logout
          </Link>
          <button 
            className="flex w-full items-center justify-center rounded-2xl bg-transparent border border-slate-700 px-4 py-3.5 text-sm font-black text-slate-300 hover:bg-slate-800 transition"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}