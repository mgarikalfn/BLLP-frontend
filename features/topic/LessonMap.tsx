import {
  WorkspaceActivity,
  WorkspaceNodeStatus,
  WorkspaceTopic,
} from "@/types/learning";
import { LessonPath, TimelineItem } from "./LessonPath";

interface LessonMapProps {
  topic: WorkspaceTopic;
}

const toTimelineItem = (activity: WorkspaceActivity, index: number): TimelineItem | null => {
  const status: WorkspaceNodeStatus = activity.status || "locked";

  if (activity.type === "LESSON") {
    const lessonId = activity.lesson?._id || activity._id;

    return {
      type: "lesson",
      id: lessonId,
      status,
      data: {
        order: activity.order ?? activity.lesson?.order ?? index + 1,
      },
    };
  }

  if (activity.type === "DIALOGUE") {
    const dialogueId = activity.dialogue?._id || activity._id;

    return {
      type: "dialogue",
      id: dialogueId,
      status,
      data: [
        {
          ...(activity.dialogue || {}),
          _id: dialogueId,
          topicId: activity.dialogue?.topicId || activity.topicId,
        },
      ],
    };
  }

  if (activity.type === "WRITING") {
    const writingId = activity.writing?._id || activity._id;

    return {
      type: "writing",
      id: writingId,
      status,
      data: [
        {
          ...(activity.writing || {}),
          _id: writingId,
          topicId: activity.writing?.topicId || activity.topicId,
        },
      ],
    };
  }

  return null;
};

const sortByOrder = (activities: WorkspaceActivity[]) => {
  return activities
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const orderA = a.item.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.item.order ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item);
};

const buildFallbackActivities = (topic: WorkspaceTopic): WorkspaceActivity[] => {
  const lessons = topic.lessons || [];
  const dialogues = topic.dialogues || [];
  const writings = topic.writingExercises || topic.writings || [];

  const allLessonsCompleted = lessons.length > 0 && lessons.every((lesson) => lesson.status === "completed");
  const hasDialogueStatusInfo = dialogues.some((dialogue) => !!dialogue.status);
  const dialoguesCompleted =
    dialogues.length === 0 ||
    !hasDialogueStatusInfo ||
    dialogues.every((dialogue) => dialogue.status === "completed");

  const lessonActivities = lessons.map((lesson, index): WorkspaceActivity => ({
    _id: lesson._id,
    type: "LESSON",
    status: lesson.status,
    order: lesson.order ?? index + 1,
    title: lesson.title,
    topicId: topic._id,
    lesson,
  }));

  const dialogueActivities = dialogues.map((dialogue, index): WorkspaceActivity => {
    const fallbackStatus: WorkspaceNodeStatus = allLessonsCompleted
      ? index === 0
        ? "active"
        : "locked"
      : "locked";

    return {
      _id: dialogue._id,
      type: "DIALOGUE",
      status: dialogue.status || fallbackStatus,
      order: lessonActivities.length + index + 1,
      title: dialogue.title,
      topicId: dialogue.topicId || topic._id,
      dialogue,
    };
  });

  const writingActivities = writings.map((writing, index): WorkspaceActivity => {
    const fallbackStatus: WorkspaceNodeStatus = allLessonsCompleted && dialoguesCompleted
      ? index === 0
        ? "active"
        : "locked"
      : "locked";

    return {
      _id: writing._id,
      type: "WRITING",
      status: writing.status || fallbackStatus,
      order: lessonActivities.length + dialogueActivities.length + index + 1,
      title: writing.title,
      topicId: writing.topicId || topic._id,
      writing,
    };
  });

  return [...lessonActivities, ...dialogueActivities, ...writingActivities];
};

export const LessonMap = ({ topic }: LessonMapProps) => {
  const activitySource = topic.activities?.length ? sortByOrder(topic.activities) : buildFallbackActivities(topic);

  const timeline = activitySource
    .map((activity, index) => toTimelineItem(activity, index))
    .filter((item): item is TimelineItem => item !== null);

  return <LessonPath timeline={timeline} />;
};
