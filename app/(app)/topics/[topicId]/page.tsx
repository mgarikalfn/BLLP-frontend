// app/(app)/topics/[topicId]/page.tsx

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import TopicWorkspaceClient from "./TopicWorkspaceClient";
import { getTopicWorkspace } from '@/api/topicWorkspace.api';

export default async function TopicWorkspacePage({ 
  params 
}: { 
  params: Promise<{ topicId: string }>
}) {
  const { topicId } = await params; 
  
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["topicWorkspace"],
    queryFn: () => getTopicWorkspace(1, 10),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TopicWorkspaceClient topicId={topicId} />
    </HydrationBoundary>
  );
}