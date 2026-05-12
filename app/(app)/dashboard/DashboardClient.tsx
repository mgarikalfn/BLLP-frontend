"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useDashboard } from "@/hooks/useDashboard";
import { LessonHeroCard } from "@/features/dashboard/LessonHeroCard";
import { PracticeCard } from "@/features/dashboard/PracticeCard";
import { DailyQuestsList } from "@/features/quests/DailyQuestsList";
import { InsightsCard } from "@/features/dashboard/InsightsCard";
import { getRedirectPath } from "@/lib/roleRedirect";
import { AlertTriangle, X } from "lucide-react";

export default function DashboardClient() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.toUpperCase();
  const { data, isLoading } = useDashboard();
  
  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  useEffect(() => {
    // If not a learner, send them to their role-appropriate dashboard
    if (role && role !== "LEARNER") {
      router.replace(getRedirectPath(role));
    }
  }, [role, router]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading || (role && role !== "LEARNER")) {
    return <div className="p-10 text-center">Loading dashboard...</div>;
  }
  
  if (!data) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

  const moderationNotification = notifications.find(n => n.type === "MODERATION" && !n.isRead);

  return (
    
    <div className="min-h-screen bg-white text-[#4b4b4b] font-sans pb-24">
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-6">
        {moderationNotification && (
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex gap-3">
              <div className="mt-0.5 text-amber-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-600 mb-1">
                  {moderationNotification.title || "Moderation Warning"}
                </h3>
                <p className="text-sm font-medium text-amber-900/80 leading-relaxed">
                  {moderationNotification.message}
                </p>
              </div>
            </div>
            <button 
              onClick={() => markAsRead(moderationNotification._id)}
              className="rounded-full p-1.5 text-amber-400 hover:bg-amber-100 hover:text-amber-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <LessonHeroCard actions={data.actions} />
        <PracticeCard actions={data.actions} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DailyQuestsList />
          <InsightsCard insights={data.insights} />
        </div>
      </main>
    </div>
  );
}