import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  completedNodes: string[];
  markCompleted: (nodeId: string) => void;
  isCompleted: (nodeId: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedNodes: [],
      markCompleted: (nodeId: string) =>
        set((state) => {
          if (!state.completedNodes.includes(nodeId)) {
            return { completedNodes: [...state.completedNodes, nodeId] };
          }
          return state;
        }),
      isCompleted: (nodeId: string) => get().completedNodes.includes(nodeId),
    }),
    {
      name: "bllp-progress-storage",
    }
  )
);
