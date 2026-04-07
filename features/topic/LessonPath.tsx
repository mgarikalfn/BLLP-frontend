import { PathNode, NodeStatus } from "./PathNode";
import { BossBattleCard } from "./BossBattleCard";

export type LessonTimelineData = {
  order: number;
};

export type TimelineBranchItem = {
  _id?: string;
  topicId?: string;
  [key: string]: unknown;
};

// Unified timeline item type
export type TimelineItem =
  | { type: "lesson"; data: LessonTimelineData; status: NodeStatus; id: string }
  | { type: "dialogue"; data: TimelineBranchItem[]; status: NodeStatus; id: string }
  | { type: "writing"; data: TimelineBranchItem[]; status: NodeStatus; id: string }
  | { type: "speaking"; data: TimelineBranchItem[]; status: NodeStatus; id: string };

interface LessonPathProps {
  timeline: TimelineItem[];
}

export const LessonPath = ({ timeline }: LessonPathProps) => {
  const nodeDistance = 110;

  return (
    <div className="relative flex flex-col items-center py-12 w-full max-w-150 overflow-hidden">
      {timeline.map((item, index) => {
        const styleOffset = Math.sin(index * 1.0) * 80;
        const hasNext = index < timeline.length - 1;

        const connector = hasNext ? (
          <div
            className="absolute z-20 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.9)]"
            style={{
              left: `calc(50% + ${styleOffset}px)`,
              top: 56,
              width: 14,
              height: `calc(100% - 56px)`,
              minHeight: nodeDistance,
              background: "linear-gradient(180deg, #f97316 0%, #0ea5e9 100%)",
              transform: "translateX(-50%)",
            }}
          />
        ) : null;

        if (item.type === "lesson") {
          return (
            <div key={item.id} className="relative z-10 w-full flex justify-center" style={{ height: nodeDistance }}>
              {connector}
              <PathNode
                id={item.id}
                order={item.data.order}
                status={item.status}
                styleOffset={styleOffset}
              />
            </div>
          );
        }

        if (item.type === "dialogue" || item.type === "writing" || item.type === "speaking") {
          const typeLabel: "DIALOGUE" | "WRITING" | "SPEAKING" =
            item.type === "dialogue" ? "DIALOGUE" : item.type === "writing" ? "WRITING" : "SPEAKING";
          return (
            <div key={item.id} className="relative z-10 w-full flex justify-center py-4" style={{ minHeight: nodeDistance }}>
              {connector}
              <BossBattleCard
                id={item.data[0]?._id || item.id}
                type={typeLabel}
                items={item.data}
                status={item.status}
                styleOffset={styleOffset}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
