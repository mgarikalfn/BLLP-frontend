import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultBannerProps {
  isCorrect: boolean;
  feedback: string;
  labels: {
    successTitle: string;
    retryTitle: string;
  };
}

export const ResultBanner = ({ isCorrect, feedback, labels }: ResultBannerProps) => {
  const Icon = isCorrect ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border-2 border-b-6 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.2)]",
        isCorrect
          ? "border-emerald-700 bg-emerald-500 text-white"
          : "border-rose-700 bg-rose-500 text-white"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0" size={24} />
        <div>
          <p className="text-xs font-black uppercase tracking-widest">
            {isCorrect ? labels.successTitle : labels.retryTitle}
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed">{feedback}</p>
        </div>
      </div>
    </div>
  );
};
