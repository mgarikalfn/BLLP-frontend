"use client";

import React from "react";
import { WorkspacePathNode, WorkspaceTopicTest } from "@/types/learning";
import { useLanguageStore } from "@/store/languageStore";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { BossBattleCard } from "./BossBattleCard";
import { NodeStatus } from "./PathNode";
import { useLessonGuard } from "@/hooks/useLessonGuard";
import { OutOfHeartsModal } from "@/features/economy/OutOfHeartsModal";

interface LessonPathContainerProps {
  topicId: string;
  pathNodes: WorkspacePathNode[];
  topicTest?: WorkspaceTopicTest;
}

export const LessonPathContainer: React.FC<LessonPathContainerProps> = ({
  topicId,
  pathNodes,
  topicTest,
}) => {
  const lang = useLanguageStore((state) => state.lang);
  const {
    gems,
    error,
    isOutOfHeartsOpen,
    isRefilling,
    guardedNavigate,
    closeOutOfHearts,
    handleRefill,
    handlePractice,
  } = useLessonGuard();
  const testNodeStatus: NodeStatus = topicTest?.status || "locked";
  const testNodeLabel = lang === "am" ? "የመጨረሻ ግምገማ" : "Final Review";

  return (
    <div className="relative flex flex-col items-center py-8 min-h-125">
      {pathNodes.map((node, index) => {
        // Calculate the S-Curve utilizing a sine wave
        const amplitude = 90;
        const xOffset = Math.sin((index / 2) * Math.PI) * amplitude;
        
        const hasNext = index < pathNodes.length - 1;
        let nextXOffset = 0;
        if (hasNext) {
          nextXOffset = Math.sin(((index + 1) / 2) * Math.PI) * amplitude;
        }
        const nodeStatus: NodeStatus = node.status || "locked";
        const isCompleted = nodeStatus === "completed";

        if (node.type === "LESSON") {
          const isLocked = nodeStatus === "locked";
          const isActive = nodeStatus === "active";
          const amharicTitle =
            typeof node.title === "object" && node.title
              ? node.title.am
              : typeof node.title === "string"
                ? node.title
                : "Lesson";
          let bgColor = "bg-gray-200 border-gray-300 text-gray-500";
          if (isCompleted) bgColor = "bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/30";
          if (isActive) bgColor = "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-300 animate-pulse";
          let icon = <Lock size={28} />;
          if (isCompleted) icon = <CheckCircle2 size={28} />;
          if (isActive) icon = <PlayCircle size={32} />;

          const renderNode = (
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center border-b-8 cursor-pointer transition-all hover:-translate-y-1 hover:brightness-110 ${bgColor}`}
              style={{ transform: `translateX(${xOffset}px)` }}
              title={amharicTitle}
            >
              {icon}
            </div>
          );

          return (
            <div key={`${node.type}-${node._id}`} className={`relative group w-full flex justify-center ${hasNext ? "mb-16" : ""}`}>
              {hasNext && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-75 h-35 -z-10 pointer-events-none">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 300 144"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={`M ${150 + xOffset} 40 C ${150 + xOffset} 90, ${150 + nextXOffset} 54, ${150 + nextXOffset} 144`}
                      fill="none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className={isCompleted ? "stroke-green-500" : "stroke-gray-300"}
                    />
                  </svg>
                </div>
              )}

              {isLocked ? (
                <div className="opacity-70 cursor-not-allowed">{renderNode}</div>
              ) : (
                <button
                  type="button"
                  onClick={() => guardedNavigate(`/lessons/${node._id}`)}
                  className="hover:scale-105 duration-200"
                >
                  {renderNode}
                </button>
              )}

              <div
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-200 text-sm font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10
                ${xOffset > 0 ? "left-[calc(50%+60px)] -translate-x-full" : "right-[calc(50%+60px)] translate-x-full"}
              `}
                style={{
                  [xOffset > 0 ? "marginRight" : "marginLeft"]: `${Math.abs(xOffset)}px`,
                }}
              >
                {amharicTitle}
                <div className="text-xs text-gray-400 font-normal capitalize">{nodeStatus}</div>
              </div>
            </div>
          );
        }

        return (
          <div key={`${node.type}-${node._id}`} className={`relative group w-full flex justify-center ${hasNext ? "mb-16" : ""}`}>
            {hasNext && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-75 h-35 -z-10 pointer-events-none">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 300 144"
                  preserveAspectRatio="none"
                >
                  <path
                    d={`M ${150 + xOffset} 40 C ${150 + xOffset} 90, ${150 + nextXOffset} 54, ${150 + nextXOffset} 144`}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={isCompleted ? "stroke-green-500" : "stroke-gray-300"}
                  />
                </svg>
              </div>
            )}

            <BossBattleCard
              id={node._id}
              type={node.type}
              items={[{ _id: node._id, topicId }]}
              status={nodeStatus}
              styleOffset={xOffset}
            />
          </div>
        );
      })}

      <div className="relative w-full flex justify-center mt-2 mb-8">
        <BossBattleCard
          id={topicId}
          type="TEST"
          items={[{ topicId }]}
          status={testNodeStatus}
          styleOffset={Math.sin((pathNodes.length / 2) * Math.PI) * 90}
          label={testNodeLabel}
        />
      </div>

      <OutOfHeartsModal
        open={isOutOfHeartsOpen}
        gems={gems}
        isRefilling={isRefilling}
        error={error}
        onClose={closeOutOfHearts}
        onRefill={handleRefill}
        onPractice={handlePractice}
      />
    </div>
  );
};