import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { WritingFeedbackResult } from "@/types/learning";

interface FeedbackCardProps {
  result: WritingFeedbackResult;
  showSampleAnswer?: boolean;
}

type FeedbackTone = "success" | "warning" | "error";

export const isPassingFeedback = (result: WritingFeedbackResult) => {
  return result.status === "PERFECT" || (result.status === "EVALUATED" && result.isCorrect);
};

const getFeedbackTone = (result: WritingFeedbackResult): FeedbackTone => {
  if (isPassingFeedback(result)) {
    return "success";
  }

  if (result.status === "TYPO") {
    return "warning";
  }

  return "error";
};

const toneStyles: Record<FeedbackTone, string> = {
  success: "border-green-300 bg-green-50 text-green-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  error: "border-rose-300 bg-rose-50 text-rose-800",
};

const toneTitle: Record<FeedbackTone, string> = {
  success: "Great work",
  warning: "Almost there",
  error: "Needs another try",
};

const toneIcon = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export const FeedbackCard = ({ result, showSampleAnswer = false }: FeedbackCardProps) => {
  const tone = getFeedbackTone(result);
  const Icon = toneIcon[tone];

  return (
    <div className={cn("rounded-2xl border-2 p-5", toneStyles[tone])}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0" size={22} />
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-widest">{toneTitle[tone]}</p>
          <p className="text-base font-semibold leading-relaxed">{result.feedback}</p>
          {showSampleAnswer && result.sampleAnswer && (
            <div className="rounded-xl border border-black/10 bg-white/70 p-3">
              <p className="text-xs font-black uppercase tracking-wider opacity-70">Sample answer</p>
              <p className="mt-1 text-base font-bold">{result.sampleAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
