import { create } from "zustand";
import { api } from "@/lib/api";

export type NotificationType = "STREAK_ALERT" | "LEVEL_UP" | "ACHIEVEMENT" | string;

export interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

interface NotificationsResponse {
  data?: AppNotification[];
}

const countUnread = (notifications: AppNotification[]) => notifications.filter((item) => !item.isRead).length;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<NotificationsResponse | AppNotification[]>("/notifications");
      const payload = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as NotificationsResponse).data)
          ? (res.data as NotificationsResponse).data || []
          : [];

      set({
        notifications: payload,
        unreadCount: countUnread(payload),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    const prev = get().notifications;
    const next = prev.map((item) => (item._id === id ? { ...item, isRead: true } : item));

    set({
      notifications: next,
      unreadCount: countUnread(next),
    });

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      set({
        notifications: prev,
        unreadCount: countUnread(prev),
      });
    }
  },

  markAllAsRead: async () => {
    const prev = get().notifications;
    const next = prev.map((item) => ({ ...item, isRead: true }));

    set({
      notifications: next,
      unreadCount: 0,
    });

    try {
      await api.patch("/notifications/read-all");
    } catch {
      set({
        notifications: prev,
        unreadCount: countUnread(prev),
      });
    }
  },
}));
