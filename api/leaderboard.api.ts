import { api } from "@/lib/api";
import { LeaderboardData } from "@/types/LeaderboardData";

const fallbackSeasonEndTime = (): string => {
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 3);
  fallback.setHours(fallback.getHours() + 14);
  fallback.setMinutes(fallback.getMinutes() + 22);
  return fallback.toISOString();
};

export const getLeaderboard = async (): Promise<LeaderboardData> => {
  const res = await api.get<{ data: LeaderboardData } | LeaderboardData>("/leaderboard");
  const payload = "data" in res.data ? res.data.data : res.data;

  return {
    ...payload,
    seasonEndTime: payload.seasonEndTime || fallbackSeasonEndTime(),
  };
};
