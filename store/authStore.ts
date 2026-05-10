import { create } from "zustand";
import type { LearningDirection } from "@/types/ProfileData";

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
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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

  logout: () => {
    localStorage.removeItem("accessToken");

    set({
      user: null,
      accessToken: null,
    });
  },
}));