import { useQuery } from "@tanstack/react-query";
import { getLesson } from "@/api/lesson.api";
import { Lesson } from "@/types/learning";

export const useLesson = (lessonId: string) => {
  return useQuery<Lesson, Error>({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLesson(lessonId),
    enabled: !!lessonId, // Only fetch if we have a lessonId
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
