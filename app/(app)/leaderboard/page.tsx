import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLeaderboard } from "@/api/leaderboard.api";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LeaderboardClient />
    </HydrationBoundary>
  );
}
