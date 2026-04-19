import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProfileClient from "./ProfileClient";
import { getProfileMe } from "@/api/profile.api";
import { PROFILE_QUERY_KEY } from "@/hooks/useProfile";

export default async function ProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfileMe,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileClient />
    </HydrationBoundary>
  );
}
