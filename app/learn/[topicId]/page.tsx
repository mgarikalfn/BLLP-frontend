/* "use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { LearnRunner } from "@/components/learn/learn-runner";
import { useLearnStore } from "@/store/user-learn-store";

export default function TopicSessionPage() {
  const { topicId } = useParams();
  const { startTopic, status } = useLearnStore();

  useEffect(() => {
    const init = async () => {
     
      if ( typeof topicId === "string") {
        await startTopic(topicId, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTAzZWNhYjUzMTNiNjEwODQ2ODNhNCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MjU1MzI3NywiZXhwIjoxNzcyNTU2ODc3fQ.IBmIS86D1AdJsppnR7skO7d-ouy4sGMPiJ89e2Ae2Sg");
      }
    };

    init();
  }, [topicId, startTopic]);

  if (status === "loading") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
        <p className="text-slate-500 font-bold">Preparing your lesson...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <p className="text-rose-500 font-bold mb-4">Could not load this topic.</p>
        <button onClick={() => window.location.reload()} className="text-sky-500 underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
       We don't show the standard header here to keep user focused on learning 
      <LearnRunner />
    </div>
  );
} */