import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useHeartModal } from "@/store/useHeartModal";

export const useLessonGuard = () => {
  const router = useRouter();
  
  // Economy state
  const hearts = useEconomyStore((s) => s.hearts);
  const gems = useEconomyStore((s) => s.gems);
  const refillHeartsWithGems = useEconomyStore((s) => s.refillHeartsWithGems);
  
  // Global Heart Modal (used by Dashboard via startLesson)
  const openHeartModal = useHeartModal((s) => s.open);

  // Local state for inline OutOfHeartsModal (used by LessonPathContainer)
  const [isOutOfHeartsOpen, setIsOutOfHeartsOpen] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Used by Dashboard Hero Card
  const startLesson = (lessonId: string) => {
    if (hearts > 0) {
      router.push(`/lessons/${lessonId}`);
    } else {
      openHeartModal();
    }
  };

  // Used by LessonPathContainer for individual map nodes
  const guardedNavigate = (path: string) => {
    if (hearts > 0) {
      router.push(path);
    } else {
      setIsOutOfHeartsOpen(true);
    }
  };

  const closeOutOfHearts = () => {
    setIsOutOfHeartsOpen(false);
    setError(null);
  };

  const handleRefill = async () => {
    if (gems < 500) {
      setError("Insufficient gems!");
      return;
    }
    
    setIsRefilling(true);
    setError(null);
    const success = await refillHeartsWithGems();
    setIsRefilling(false);
    
    if (success) {
      closeOutOfHearts();
    } else {
      setError("Failed to refill. Please try again.");
    }
  };

  const handlePractice = () => {
    closeOutOfHearts();
    router.push("/practice");
  };

  return { 
    startLesson, 
    guardedNavigate, 
    gems, 
    error, 
    isOutOfHeartsOpen, 
    isRefilling, 
    closeOutOfHearts, 
    handleRefill, 
    handlePractice 
  };
};
