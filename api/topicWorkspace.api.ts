import { api } from "@/lib/api";
import {
  TopicWorkspaceResponse,
  ApiResponse,
  WorkspacePathNode,
  WorkspacePathNodeType,
  WorkspaceTopic,
} from "@/types/learning";

const isPathNodeType = (value: unknown): value is WorkspacePathNodeType => {
  return value === "LESSON" || value === "DIALOGUE" || value === "WRITING" || value === "SPEAKING";
};

const normalizePathNodes = (nodes: unknown, topicId: string): WorkspacePathNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes
    .filter((node): node is Record<string, unknown> => !!node && typeof node === "object")
    .filter((node) => typeof node._id === "string" && isPathNodeType(node.type) && typeof node.status === "string")
    .map((node) => ({
      _id: node._id as string,
      title: node.title as WorkspacePathNode["title"],
      type: node.type as WorkspacePathNodeType,
      status: node.status as WorkspacePathNode["status"],
      topicId,
    }));
};

const normalizeTopic = (topic: WorkspaceTopic): WorkspaceTopic => {
  const normalizedPathNodes = normalizePathNodes(topic.pathNodes, topic._id);
  const progress = topic.progress || { percentage: 0 };

  // Keep old fields populated for components not yet migrated from split arrays.
  const lessons = normalizedPathNodes
    .filter((node) => node.type === "LESSON")
    .map((node, index) => ({
      _id: node._id,
      title: (typeof node.title === "object" && node.title ? node.title : { am: "Lesson", ao: "Barnoota" }) as {
        am: string;
        ao: string;
      },
      status: node.status,
      order: index + 1,
    }));

  const dialogues = normalizedPathNodes
    .filter((node) => node.type === "DIALOGUE")
    .map((node) => ({
      _id: node._id,
      title: (typeof node.title === "object" && node.title ? node.title : { am: "Dialogue", ao: "Marii" }) as {
        am: string;
        ao: string;
      },
      status: node.status,
      topicId: topic._id,
    }));

  const writingExercises = normalizedPathNodes
    .filter((node) => node.type === "WRITING")
    .map((node) => ({
      _id: node._id,
      title: node.title,
      status: node.status,
      topicId: topic._id,
    }));

  const speakingExercises = normalizedPathNodes
    .filter((node) => node.type === "SPEAKING")
    .map((node) => ({
      _id: node._id,
      title: node.title,
      status: node.status,
      topicId: topic._id,
    }));

  return {
    ...topic,
    pathNodes: normalizedPathNodes,
    lessons: topic.lessons && topic.lessons.length > 0 ? topic.lessons : lessons,
    dialogues: topic.dialogues && topic.dialogues.length > 0 ? topic.dialogues : dialogues,
    writingExercises:
      topic.writingExercises && topic.writingExercises.length > 0 ? topic.writingExercises : writingExercises,
    speakingExercises:
      topic.speakingExercises && topic.speakingExercises.length > 0 ? topic.speakingExercises : speakingExercises,
    progress: {
      ...progress,
      completedCount: progress.completedCount ?? progress.completedLessons ?? 0,
      totalCount: progress.totalCount ?? progress.totalLessons ?? 0,
      completedLessons: progress.completedLessons ?? progress.completedCount ?? 0,
      totalLessons: progress.totalLessons ?? progress.totalCount ?? 0,
      percentage: progress.percentage ?? 0,
    },
  };
};

const normalizeWorkspaceResponse = (payload: TopicWorkspaceResponse): TopicWorkspaceResponse => {
  return {
    ...payload,
    topics: Array.isArray(payload.topics) ? payload.topics.map(normalizeTopic) : [],
  };
};

export const getTopicWorkspace = async (page: number = 1, limit: number = 10): Promise<TopicWorkspaceResponse> => {
  const res = await api.get<ApiResponse<TopicWorkspaceResponse> | TopicWorkspaceResponse>(`/workspace`, {
    params: { page, limit }
  });

  if (!("success" in res.data)) {
    return normalizeWorkspaceResponse(res.data);
  }
  
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch workspace data");
  }
  
  return normalizeWorkspaceResponse(res.data.data);
};