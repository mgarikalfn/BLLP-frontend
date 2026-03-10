import { Lesson } from "@/types/learning";
import { PathNode } from "./PathNode";

interface LessonPathProps {
  lessons: Lesson[];
  completedCount: number;
}

export const LessonPath = ({ lessons, completedCount }: LessonPathProps) => {
  return (
    <div className="flex flex-col items-center py-10 w-full space-y-8">
      {lessons.map((lesson, index) => {
        // Determine Status
        let status: "completed" | "current" | "locked" = "locked";
        if (index < completedCount) status = "completed";
        else if (index === completedCount) status = "current";

        // Calculate Zig-Zag Offset (Sine wave pattern)
        // This moves nodes left and right: 0, 40, 0, -40...
        const styleOffset = Math.sin(index * 1.5) * 60;

        return (
          <PathNode
            key={lesson._id}
            id={lesson._id}
            order={lesson.order}
            status={status}
            styleOffset={styleOffset}
          />
        );
      })}
    </div>
  );
};