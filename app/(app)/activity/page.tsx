"use client";

import { useEffect, useMemo } from "react";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore, type AppNotification } from "@/store/useNotificationStore";
import { useLanguageStore } from "@/store/languageStore";

const uiText = {
  am: {
    activity: "እንቅስቃሴ",
    markAllRead: "ሁሉንም እንደተነበበ ምልክት አድርግ",
    today: "ዛሬ",
    yesterday: "ትናንት",
    earlier: "ቀደም ብሎ",
    noActivity: "እስካሁን ምንም እንቅስቃሴ የለም።",
    mAgo: "ደቂቃዎች በፊት",
    hAgo: "ሰዓታት በፊት",
    dAgo: "ቀናት በፊት"
  },
  ao: {
    activity: "Sochii",
    markAllRead: "Sana hundaa dubbifamee godhi",
    today: "HAR'A",
    yesterday: "KALEESSA",
    earlier: "DURAAN",
    noActivity: "Hanga ammaatti sochiin hin jiru.",
    mAgo: "Daqiqa dura",
    hAgo: "Sa'aati dura",
    dAgo: "Guyyaa dura"
  }
} as const;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const startOfYesterday = () => {
  const today = startOfToday();
  return today - 24 * 60 * 60 * 1000;
};

const groupNotifications = (notifications: AppNotification[]) => {
  const todayBoundary = startOfToday();
  const yesterdayBoundary = startOfYesterday();

  const grouped = {
    TODAY: [] as AppNotification[],
    YESTERDAY: [] as AppNotification[],
    EARLIER: [] as AppNotification[],
  };

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  sorted.forEach((notification) => {
    const time = new Date(notification.createdAt).getTime();

    if (time >= todayBoundary) {
      grouped.TODAY.push(notification);
      return;
    }

    if (time >= yesterdayBoundary && time < todayBoundary) {
      grouped.YESTERDAY.push(notification);
      return;
    }

    grouped.EARLIER.push(notification);
  });

  return grouped;
};

const relativeTime = (createdAt: string, t: typeof uiText[keyof typeof uiText]) => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return `${minutes} ${t.mAgo}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${t.hAgo}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t.dAgo}`;
};

const iconByType = (type: string) => {
  if (type === "STREAK_ALERT") {
    return {
      icon: Flame,
      wrapperClass: "bg-rose-100 text-rose-600",
    };
  }

  if (type === "LEVEL_UP") {
    return {
      icon: TrendingUp,
      wrapperClass: "bg-sky-100 text-sky-600",
    };
  }

  if (type === "ACHIEVEMENT") {
    return {
      icon: Trophy,
      wrapperClass: "bg-amber-100 text-amber-600",
    };
  }

  return {
    icon: BellFallback,
    wrapperClass: "bg-slate-100 text-slate-600",
  };
};

function BellFallback() {
  return (
    <span className="text-sm font-black" aria-hidden="true">
      •
    </span>
  );
}

export default function ActivityPage() {
  const notifications = useNotificationStore((state) => state.notifications);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const lang = useLanguageStore((state) => state.lang);
  const t = uiText[lang];

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">{t.activity}</h1>
        <button
          type="button"
          onClick={() => {
            void markAllAsRead();
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
        >
          {t.markAllRead}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      ) : (
        <div className="relative pl-7">
          <div className="absolute bottom-0 left-2 top-0 w-px bg-slate-200" />

          {(["TODAY", "YESTERDAY", "EARLIER"] as const).map((groupKey) => {
            const items = groups[groupKey];
            if (items.length === 0) return null;
            
            const titleMap = {
              "TODAY": t.today,
              "YESTERDAY": t.yesterday,
              "EARLIER": t.earlier
            };

            return (
              <div key={groupKey} className="mb-7">
                <div className="relative mb-3">
                  <span className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-300 bg-white" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{titleMap[groupKey]}</h2>
                </div>

                <div className="space-y-3">
                  {items.map((notification) => {
                    const iconConfig = iconByType(notification.type);
                    const Icon = iconConfig.icon;

                    return (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => {
                          if (!notification.isRead) {
                            void markAsRead(notification._id);
                          }
                        }}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-200",
                          notification.isRead
                            ? "bg-white hover:bg-slate-50"
                            : "bg-sky-50/65 hover:bg-sky-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconConfig.wrapperClass)}>
                              <Icon size={18} />
                            </span>
                            <div>
                              <p className="text-sm font-black text-slate-800">{notification.title}</p>
                              <p className="mt-1 text-sm font-medium text-slate-500">{notification.message}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            {relativeTime(notification.createdAt, t)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
              {t.noActivity}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
