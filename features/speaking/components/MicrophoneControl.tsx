import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicrophoneControlProps {
  isRecording: boolean;
  disabled?: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const MicrophoneControl = ({
  isRecording,
  disabled = false,
  onStartRecording,
  onStopRecording,
}: MicrophoneControlProps) => {
  const handlePressStart = () => {
    if (disabled || isRecording) return;
    onStartRecording();
  };

  const handlePressEnd = () => {
    if (disabled || !isRecording) return;
    onStopRecording();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={(event) => {
          event.preventDefault();
          handlePressStart();
        }}
        onTouchEnd={(event) => {
          event.preventDefault();
          handlePressEnd();
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            event.preventDefault();
            handlePressStart();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handlePressEnd();
          }
        }}
        disabled={disabled}
        className={cn(
          "relative flex size-36 items-center justify-center rounded-full border-b-8 text-white shadow-[0_16px_40px_rgba(15,23,42,0.2)] transition-all duration-200 outline-none",
          "focus-visible:ring-4 focus-visible:ring-sky-300",
          isRecording
            ? "bg-rose-500 border-rose-700 animate-pulse"
            : "bg-emerald-500 border-emerald-700 active:border-b-2 active:translate-y-1",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {isRecording ? <MicOff size={52} strokeWidth={2.5} /> : <Mic size={52} strokeWidth={2.5} />}
      </button>

      <p className="text-sm font-black uppercase tracking-widest text-slate-500">
        {isRecording ? "Recording... release to stop" : "Press and hold to speak"}
      </p>
    </div>
  );
};
