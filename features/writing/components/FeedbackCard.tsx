import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingFeedbackResult } from "@/types/learning";

interface FeedbackCardProps {
  result: WritingFeedbackResult;
}

const isPassingResult = (result: WritingFeedbackResult) => {
  return result.status === "PERFECT" || (result.status === "EVALUATED" && result.isCorrect);
};

const isWarningResult = (result: WritingFeedbackResult) => result.status === "TYPO";

const getFeedbackCardStyles = (result: WritingFeedbackResult) => {
  if (isPassingResult(result)) {
    return {
      wrapper: "border-green-200 bg-green-50",
      title: "text-green-700",
      body: "text-green-800",
      icon: CheckCircle2,
      label: "Great Work",
    };
  }

  if (isWarningResult(result)) {
    return {
      wrapper: "border-amber-200 bg-amber-50",
      title: "text-amber-700",
      body: "text-amber-800",
      icon: CircleAlert,
      label: "Almost There",
    };
  }

  return {
    wrapper: "border-rose-200 bg-rose-50",
    title: "text-rose-700",
    body: "text-rose-800",
    icon: CircleX,
    label: "Try Again",
  };
};

export const shouldShowSampleAnswer = (result: WritingFeedbackResult) => {
  return result.status === "TYPO" || result.status === "INCORRECT" || (result.status === "EVALUATED" && !result.isCorrect);
};

export const isSuccessfulWritingResult = isPassingResult;

export const FeedbackCard = ({ result }: FeedbackCardProps) => {
  const styles = getFeedbackCardStyles(result);
  const Icon = styles.icon;
  const showSampleAnswer = shouldShowSampleAnswer(result) && !!result.sampleAnswer?.trim();

  return (
    <section className={cn("rounded-2xl border-2 p-5", styles.wrapper)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5", styles.title)} size={22} />

        <div>
          <h2 className={cn("text-sm font-black uppercase tracking-wider", styles.title)}>{styles.label}</h2>
          <p className={cn("mt-2 text-base font-semibold leading-relaxed", styles.body)}>{result.feedback}</p>
        </div>
      </div>

      {showSampleAnswer ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/90 p-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Sample Answer</p>
          <p className="mt-2 text-base font-semibold text-slate-700">{result.sampleAnswer}</p>
        </div>
      ) : null}
    </section>
  );
};
