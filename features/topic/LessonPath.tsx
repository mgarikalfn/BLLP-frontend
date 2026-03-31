import { Lesson } from "@/types/learning";
import { PathNode, NodeStatus } from "./PathNode";
import { BossBattleCard } from "./BossBattleCard";

// Unified timeline item type
export type TimelineItem =
  | { type: "lesson"; data: Lesson; status: NodeStatus; id: string }
  | { type: "dialogue"; data: any[]; status: NodeStatus; id: string }
  | { type: "writing"; data: any[]; status: NodeStatus; id: string };

interface LessonPathProps {
  timeline: TimelineItem[];
}

export const LessonPath = ({ timeline }: LessonPathProps) => {
  // Config for path drawing
  const nodeDistance = 110; 
  const strokeWidth = 14;
  const viewBoxWidth = 300;
  const centerX = viewBoxWidth / 2;

  // Generate SVG Path
  const generatePath = () => {
    if (timeline.length < 2) return "";
    let d = "";

    timeline.forEach((item, i) => {
      const offsetX = Math.sin(i * 1.0) * 80;
      const x = centerX + offsetX;
      const y = i * nodeDistance + 45; // Start inside the first node

      if (i === 0) {
        d += `M ${x} ${y} `;
      } else {
        const prevOffsetX = Math.sin((i - 1) * 1.0) * 80;
        const prevX = centerX + prevOffsetX;
        const prevY = (i - 1) * nodeDistance + 45;

        // Draw a smooth bezier curve between nodes
        const controlY1 = prevY + nodeDistance / 2;
        const controlY2 = y - nodeDistance / 2;
        d += `C ${prevX} ${controlY1}, ${x} ${controlY2}, ${x} ${y} `;
      }
    });

    return d;
  };

  return (
    <div className="relative flex flex-col items-center py-12 w-full max-w-[600px] overflow-hidden">
      {/* Background SVG path connecting the nodes */}
      <svg
        className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        width={viewBoxWidth}
        height={timeline.length * nodeDistance}
        viewBox={`0 0 ${viewBoxWidth} ${timeline.length * nodeDistance}`}
      >
        <path
          d={generatePath()}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {timeline.map((item, index) => {
        // Calculate Zig-Zag Offset (Sine wave pattern for sweeping left to right)
        // Adjust multiplier (1.0 vs 1.5) to widen or tighten the curve.
        const styleOffset = Math.sin(index * 1.0) * 80;

        if (item.type === "lesson") {
          return (
            <div key={item.id} className="relative z-10 w-full flex justify-center" style={{ height: nodeDistance }}>
              <PathNode
                id={item.id}
                order={item.data.order}
                status={item.status}
                styleOffset={styleOffset}
              />
            </div>
          );
        }

        if (item.type === "dialogue" || item.type === "writing") {
          const typeLabel = item.type === "dialogue" ? "DIALOGUE" : "WRITING";
          return (
            <div key={item.id} className="relative z-10 w-full flex justify-center py-4" style={{ minHeight: nodeDistance }}>
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
