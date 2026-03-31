import { api } from "@/lib/api";
import { Lesson } from "@/types/learning";

export const getLesson = async (lessonId: string): Promise<Lesson> => {
  const res = await api.get(`learn/lessons/${lessonId}`);
  // If the backend wraps it in { data: ... }, return res.data.data
  // Otherwise if the backend returns the object directly, return res.data
  return res.data.data ?? res.data;
};
