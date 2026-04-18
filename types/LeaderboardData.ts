export type LeaderboardZone = "PROMOTION" | "SAFE" | "DEMOTION";

export interface LeaderboardUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  seasonXp: number;
  level: number;
  currentStreak?: number;
  seasonTier?: string;
}

export interface LeaderboardPagination {
  page: number;
  totalPages: number;
  totalInTier: number;
  tier: string;
}

export interface CurrentUserLeaderboardData {
  rank: number;
  id: string;
  username: string;
  avatarUrl: string | null;
  seasonXp: number;
  level: number;
  tier: string;
  zone: LeaderboardZone;
}

export interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  pagination: LeaderboardPagination;
  currentUser: CurrentUserLeaderboardData;
  seasonEndTime?: string;
}
