import { create } from "zustand";
import type { LearningDirection } from "@/types/ProfileData";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  learningDirection?: LearningDirection;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;

  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  login: (user, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.removeItem("token");

    set({
      user,
      accessToken,
    });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      localStorage.removeItem("accessToken");
      set({
        user: null,
        accessToken: null,
      });
    }
  },

  hydrate: () => {
    // If user is already in the store, nothing to do
    if (get().user) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      set({
        user: {
          id: payload.id || payload.sub || "",
          username: payload.username || "",
          role: payload.role || "LEARNER",
          learningDirection: payload.learningDirection,
        },
        accessToken: token,
      });
    } catch {
      // Token is malformed — clear it
      localStorage.removeItem("accessToken");
    }
  },
}));