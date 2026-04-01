import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getTopicWorkspace } from '@/api/topicWorkspace.api';
import { LearnFeed } from '@/features/topic/LearnFeed';

export default async function TopicsPage() {
  const queryClient = new QueryClient();

  // Prefetch the first page
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["topicWorkspace", "infinite"],
    queryFn: () => getTopicWorkspace(1, 5),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-start w-full relative">
        <LearnFeed />
      </div>
    </HydrationBoundary>
  );
}