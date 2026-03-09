import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getDashboard } from "@/api/dashboard.api";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // Prefetching ensures the data is ready before the page hits the browser
  await queryClient.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  return (
    // This boundary passes the prefetched data to useQuery() inside DashboardClient
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}