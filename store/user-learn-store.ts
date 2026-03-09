/* import { create } from "zustand";
import { Lesson } from "@/types/study";
import { LearnAPI } from "@/lib/api/learn";

interface LearnState {
  lessons: Lesson[];
  currentIndex: number;
  mode: "presentation" | "quiz" | "summary";
  status: "idle" | "loading" | "active" | "error";
  
  // User Language Preferences
  nativeLang: "am" | "ao";
  learningLang: "am" | "ao";

  startTopic: (topicId: string, token: string) => Promise<void>;
  nextStep: () => void;
  completeLesson: (token: string) => Promise<void>;
}

export const useLearnStore = create<LearnState>((set, get) => ({
  lessons: [],
  currentIndex: 0,
  mode: "presentation",
  status: "idle",
  nativeLang: "am", // Default (This would eventually come from user profile)
  learningLang: "ao",

  // Inside useLearnStore...

  startTopic: async (topicId: string, token: string) => {
    set({ status: "loading" });
    try {
      const data = await LearnAPI.getTopicLessons(topicId, token);
      
      set({ 
        lessons: data.lessons, // 👈 Extracting the lessons array from the response
        status: "active", 
        currentIndex: 0, 
        mode: "presentation" 
      });

      console.log(`🚀 Started Topic: ${data.topic.title.am}`);
    } catch (error) {
      console.error("Learn Store Error:", error);
      set({ status: "error" });
    }
  },

  nextStep: () => {
    const { mode } = get();
    if (mode === "presentation") {
      set({ mode: "quiz" });
    } else {
      // Quiz logic happens in the component, this just triggers the move
    }
  },

  completeLesson: async (token) => {
    const { lessons, currentIndex } = get();
    const currentLesson = lessons[currentIndex];
    
    await LearnAPI.completeLesson(currentLesson._id, token);

    if (currentIndex < lessons.length - 1) {
      set({ currentIndex: currentIndex + 1, mode: "presentation" });
    } else {
      set({ mode: "summary" });
    }
  }
})); */