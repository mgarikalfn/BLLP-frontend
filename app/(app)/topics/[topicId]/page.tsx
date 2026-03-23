// app/(app)/topics/[topicId]/page.tsx

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import TopicWorkspaceClient from "./TopicWorkspaceClient";
import { getTopicWorkspace } from '@/api/topicWorkspace.api';

export default async function TopicWorkspacePage({ 
  params 
}: { 
  params: Promise<{ topicId: string }> // 1. Update type to Promise
}) {
  // 2. Unwrap the promise here
  const { topicId } = await params; 
  
  const queryClient = new QueryClient();

  // 3. Use the unwrapped topicId for prefetching
  await queryClient.prefetchQuery({
    queryKey: ["topicWorkspace", topicId],
    queryFn: () => getTopicWorkspace(topicId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 4. Pass the unwrapped topicId to your client component */}
      <TopicWorkspaceClient topicId={topicId} />
    </HydrationBoundary>
  );
}