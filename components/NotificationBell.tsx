"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/useNotificationStore";

const relativeTime = (createdAt: string) => {
  const ms = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(ms / 60000));

  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const recent = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[72] w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_35px_rgba(15,23,42,0.18)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Recent Activity</p>
            {unreadCount > 0 ? <span className="text-xs font-bold text-rose-600">{unreadCount} new</span> : null}
          </div>

          <div className="space-y-2">
            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-500">
                No notifications yet.
              </div>
            ) : (
              recent.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{relativeTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2">{item.message}</p>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/activity");
            }}
            className="mt-3 h-10 w-full rounded-xl bg-slate-900 text-sm font-black uppercase tracking-wide text-white transition hover:bg-slate-800"
          >
            See All Activity
          </button>
        </div>
      ) : null}
    </div>
  );
}
