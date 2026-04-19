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
  token: string | null;

  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: (user, token) => {
    localStorage.setItem("token", token);

    set({
      user,
      token,
    });
  },

  logout: () => {
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
    });
  },
}));