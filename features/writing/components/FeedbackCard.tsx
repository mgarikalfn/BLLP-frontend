import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { WritingFeedbackResult } from "@/types/learning";

type LearningLanguage = "am" | "ao";

interface FeedbackCardProps {
  result: WritingFeedbackResult;
  nativeLanguage: LearningLanguage;
}

const feedbackUiText = {
  am: {
    labels: {
      success: "በጣም ጥሩ",
      warning: "ጥቂት ቀርቷል",
      error: "እንደገና ይሞክሩ",
    },
    sampleAnswer: "ትክክለኛ መልስ",
  },
  ao: {
    labels: {
      success: "Baay'ee gaarii",
      warning: "Xiqqoo hafa",
      error: "Irra deebi'ii yaali",
    },
    sampleAnswer: "Deebii sirrii",
  },
} as const;

const isPassingResult = (result: WritingFeedbackResult) => {
  return result.status === "PERFECT" || (result.status === "EVALUATED" && result.isCorrect);
};

const isWarningResult = (result: WritingFeedbackResult) => result.status === "TYPO";

const getFeedbackCardStyles = (result: WritingFeedbackResult, nativeLanguage: LearningLanguage) => {
  const uiText = feedbackUiText[nativeLanguage];

  if (isPassingResult(result)) {
    return {
      wrapper: "border-green-200 bg-green-50",
      title: "text-green-700",
      body: "text-green-800",
      icon: CheckCircle2,
      label: uiText.labels.success,
    };
  }

  if (isWarningResult(result)) {
    return {
      wrapper: "border-amber-200 bg-amber-50",
      title: "text-amber-700",
      body: "text-amber-800",
      icon: CircleAlert,
      label: uiText.labels.warning,
    };
  }

  return {
    wrapper: "border-rose-200 bg-rose-50",
    title: "text-rose-700",
    body: "text-rose-800",
    icon: CircleX,
    label: uiText.labels.error,
  };
};

export const shouldShowSampleAnswer = (result: WritingFeedbackResult) => {
  return result.status === "TYPO" || result.status === "INCORRECT" || (result.status === "EVALUATED" && !result.isCorrect);
};

export const isSuccessfulWritingResult = isPassingResult;

export const FeedbackCard = ({ result, nativeLanguage }: FeedbackCardProps) => {
  const styles = getFeedbackCardStyles(result, nativeLanguage);
  const Icon = styles.icon;
  const showSampleAnswer = shouldShowSampleAnswer(result) && !!result.sampleAnswer?.trim();
  const sampleAnswerLabel = feedbackUiText[nativeLanguage].sampleAnswer;

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
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">{sampleAnswerLabel}</p>
          <p className="mt-2 text-base font-semibold text-slate-700">{result.sampleAnswer}</p>
        </div>
      ) : null}
    </section>
  );
};
