"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/api/leaderboard.api";

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });
};
