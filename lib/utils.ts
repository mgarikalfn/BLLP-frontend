import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateNodeStatuses(allLessons: any[], completedLessonIds: string[]) {
  return allLessons.map((lesson, index) => {
    const isCompleted = completedLessonIds.includes(lesson._id);
    const isVerified = lesson.isVerified !== false;
    
    // First node is active if not completed, or if previous node is completed
    const previousCompleted = index === 0 || completedLessonIds.includes(allLessons[index - 1]._id);
    
    let status: 'completed' | 'active' | 'locked' = 'locked';
    
    if (isCompleted) {
      status = 'completed';
    } else if (previousCompleted && isVerified) {
      status = 'active';
    }
    
    return {
      ...lesson,
      status
    };
  });
}
