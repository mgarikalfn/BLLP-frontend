import { create } from "zustand";
import { api } from "@/lib/api";
import { soundDing, soundHeartbeat, launchConfetti } from "@/lib/gameEffects";

export type DailyQuestType = "XP" | "LESSONS" | "ACCURACY";
export type AchievementType = "STREAK" | "TOTAL_XP" | "TOPICS" | "XP";

export interface DailyQuest {
  _id: string;
  type: DailyQuestType;
  description: string;
  targetValue: number;
  currentValue: number;
  rewardGems: number;
  isClaimed: boolean;
}

export interface Achievement {
  _id: string;
  title: string;
  type: AchievementType;
  currentProgress: number;
  targetValue: number;
  level: number;
  rewardGems: number;
  isClaimed: boolean;
}

interface EconomyState {
  gems: number;
  hearts: number;
  streakFreezeActive: number;
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
  isLoading: boolean;
  isClaimingReward: boolean;
  error: string | null;
  fetchEconomyStatus: () => Promise<void>;
  deductHeart: () => Promise<boolean>;
  refillHeartsWithGems: () => Promise<boolean>;
  buyStreakFreeze: () => Promise<boolean>;
  earnHeart: () => Promise<boolean>;
  claimReward: (payload: { type: "QUEST" | "ACHIEVEMENT"; id: string }) => Promise<boolean>;
}

type EconomyPayload = {
  gems?: number;
  hearts?: number;
  streakFreezeActive?: number;
  dailyQuests?: DailyQuest[];
  achievements?: Achievement[];
};

const extractPayload = (value: unknown): EconomyPayload => {
  if (!value || typeof value !== "object") return {};
  const record = value as {
    data?: unknown;
    gems?: unknown;
    hearts?: unknown;
    streakFreezeActive?: unknown;
    dailyQuests?: unknown;
    achievements?: unknown;
  };

  const parseQuestArray = (input: unknown): DailyQuest[] | undefined =>
    Array.isArray(input) ? (input as DailyQuest[]) : undefined;
  const parseAchievementArray = (input: unknown): Achievement[] | undefined =>
    Array.isArray(input) ? (input as Achievement[]) : undefined;

  if (record.data && typeof record.data === "object") {
    const nested = record.data as {
      gems?: unknown;
      hearts?: unknown;
      streakFreezeActive?: unknown;
      dailyQuests?: unknown;
      achievements?: unknown;
    };
    return {
      gems: typeof nested.gems === "number" ? nested.gems : undefined,
      hearts: typeof nested.hearts === "number" ? nested.hearts : undefined,
      streakFreezeActive: typeof nested.streakFreezeActive === "number" ? nested.streakFreezeActive : undefined,
      dailyQuests: parseQuestArray(nested.dailyQuests),
      achievements: parseAchievementArray(nested.achievements),
    };
  }

  return {
    gems: typeof record.gems === "number" ? record.gems : undefined,
    hearts: typeof record.hearts === "number" ? record.hearts : undefined,
    streakFreezeActive: typeof record.streakFreezeActive === "number" ? record.streakFreezeActive : undefined,
    dailyQuests: parseQuestArray(record.dailyQuests),
    achievements: parseAchievementArray(record.achievements),
  };
};

const toErrorMessage = (error: unknown, fallback: string) =>
  typeof error === "object" && error !== null && "response" in error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback)
    : error instanceof Error
      ? error.message
      : fallback;

export const useEconomyStore = create<EconomyState>((set, get) => ({
  gems: 0,
  hearts: 0,
  streakFreezeActive: 0,
  dailyQuests: [],
  achievements: [],
  isLoading: false,
  isClaimingReward: false,
  error: null,

  fetchEconomyStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/economy/status");
      const payload = extractPayload(res.data);

      set({
        gems: payload.gems ?? get().gems,
        hearts: payload.hearts ?? get().hearts,
        streakFreezeActive: payload.streakFreezeActive ?? get().streakFreezeActive,
        dailyQuests: payload.dailyQuests ?? get().dailyQuests,
        achievements: payload.achievements ?? get().achievements,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        isLoading: false,
        error: toErrorMessage(error, "Failed to fetch economy status"),
      });
    }
  },

  deductHeart: async () => {
    const state = get();
    if (state.hearts <= 0) {
      set({ error: "No hearts left." });
      return false;
    }

    const previousHearts = state.hearts;
    set({ hearts: previousHearts - 1, error: null });

    try {
      const res = await api.post("/economy/deduct-heart");
      const payload = extractPayload(res.data);
      if (typeof payload.hearts === "number") {
        set({ hearts: payload.hearts });
      }
      if (typeof payload.gems === "number") {
        set({ gems: payload.gems });
      }
      // 💔 Heartbeat sound on successful heart loss
      soundHeartbeat();
      return true;
    } catch (error: unknown) {
      set({
        hearts: previousHearts,
        error: toErrorMessage(error, "Could not deduct heart"),
      });
      return false;
    }
  },

  refillHeartsWithGems: async () => {
    const state = get();
    const previousState = { gems: state.gems, hearts: state.hearts };

    if (state.gems < 500) {
      set({ error: "Insufficient gems to refill hearts." });
      return false;
    }

    set({
      gems: state.gems - 500,
      hearts: 5,
      error: null,
    });

    try {
      const res = await api.post("/economy/refill-hearts");
      const payload = extractPayload(res.data);

      set({
        gems: payload.gems ?? state.gems - 500,
        hearts: payload.hearts ?? 5,
      });

      return true;
    } catch (error: unknown) {
      set({
        gems: previousState.gems,
        hearts: previousState.hearts,
        error: toErrorMessage(error, "Could not refill hearts"),
      });
      return false;
    }
  },

  buyStreakFreeze: async () => {
    const state = get();
    const cost = 200;
    
    if (state.gems < cost) {
      set({ error: "Not enough gems." });
      return false;
    }

    const previousState = { gems: state.gems, streakFreezeActive: state.streakFreezeActive };

    set({
      error: null,
      gems: state.gems - cost,
      streakFreezeActive: state.streakFreezeActive + 1
    });

    try {
      const res = await api.post("/economy/buy-item", { itemType: "STREAK_FREEZE" });
      const payload = extractPayload(res.data);

      set({
        gems: payload.gems ?? state.gems,
        streakFreezeActive: payload.streakFreezeActive ?? state.streakFreezeActive,
      });

      return true;
    } catch (error: unknown) {
      set({
        gems: previousState.gems,
        streakFreezeActive: previousState.streakFreezeActive,
        error: toErrorMessage(error, "Could not buy streak freeze"),
      });
      return false;
    }
  },

  earnHeart: async () => {
    const state = get();
    if (state.hearts >= 5) {
      return false; // already full
    }

    const previousHearts = state.hearts;
    // Optimistic update
    set({ hearts: previousHearts + 1, error: null });

    try {
      const res = await api.post("/economy/earn-heart");
      const payload = extractPayload(res.data);
      if (typeof payload.hearts === "number") {
        set({ hearts: payload.hearts });
      }
      return true;
    } catch (error: unknown) {
      set({
        hearts: previousHearts,
        error: toErrorMessage(error, "Could not earn heart"),
      });
      return false;
    }
  },

  claimReward: async ({ type, id }) => {
    const state = get();
    const previousState = {
      gems: state.gems,
      dailyQuests: state.dailyQuests,
      achievements: state.achievements,
    };

    set({ isClaimingReward: true, error: null });

    if (type === "QUEST") {
      const quest = state.dailyQuests.find((item) => item._id === id);
      if (quest) {
        set({
          gems: state.gems + (quest.rewardGems || 0),
          dailyQuests: state.dailyQuests.map((item) =>
            item._id === id ? { ...item, isClaimed: true } : item
          ),
        });
      }
    } else {
      const achievement = state.achievements.find((item) => item._id === id);
      if (achievement) {
        set({
          gems: state.gems + (achievement.rewardGems || 0),
          achievements: state.achievements.map((item) =>
            item._id === id ? { ...item, isClaimed: true } : item
          ),
        });
      }
    }

    try {
      const res = await api.post("/economy/claim-reward", { type, id });
      const payload = extractPayload(res.data);
      set({
        gems: payload.gems ?? get().gems,
        hearts: payload.hearts ?? get().hearts,
        dailyQuests: payload.dailyQuests ?? get().dailyQuests,
        achievements: payload.achievements ?? get().achievements,
        isClaimingReward: false,
      });
      // 🎉 Confetti + ding on successful claim
      soundDing();
      void launchConfetti();
      return true;
    } catch (error: unknown) {
      set({
        gems: previousState.gems,
        dailyQuests: previousState.dailyQuests,
        achievements: previousState.achievements,
        isClaimingReward: false,
        error: toErrorMessage(error, "Could not claim reward"),
      });
      return false;
    }
  },
}));
