import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ProfileClient from "./ProfileClient";
import { getProfileMe } from "@/api/profile.api";

export default async function ProfilePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfileMe,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileClient />
    </HydrationBoundary>
  );
}
