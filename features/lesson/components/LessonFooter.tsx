import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonFooterProps {
  status: "idle" | "checking" | "correct" | "incorrect" | "completed";
  onCheck: () => void;
  onContinue: () => void;
  disabled: boolean;
  isLearningSlide?: boolean;
  correctAnswerText?: string;
}

export const LessonFooter = ({
  status,
  onCheck,
  onContinue,
  disabled,
  isLearningSlide,
  correctAnswerText,
}: LessonFooterProps) => {

  if (!isLearningSlide && status === "idle" && disabled) {
    return <div className="w-full border-t-2 border-gray-200 bg-white p-4 sm:p-6 md:px-8" />;
  }

  if (status === "correct") {
    return (
      <div className="w-full bg-green-100 border-t-2 border-green-200 p-4 sm:p-6 md:px-8 animate-in slide-in-from-bottom-full duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-green-600 font-bold text-2xl gap-3 w-full sm:w-auto">
            <div className="bg-white text-green-500 p-2 rounded-full shadow-sm">
              <Check size={24} strokeWidth={3} />
            </div>
            Correct!
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-48 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-xl shadow-sm hover:shadow-md h-12 transition-all active:translate-y-1"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (status === "incorrect") {
    return (
      <div className="w-full bg-red-100 border-t-2 border-red-200 p-4 sm:p-6 md:px-8 animate-in slide-in-from-bottom-full duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center text-red-500 font-bold text-2xl gap-3 w-full sm:w-auto">
            <div className="bg-white text-red-500 p-2 rounded-full shadow-sm mt-1 sm:mt-0 shrink-0">
              <X size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-red-500">Incorrect</span>
              {correctAnswerText && (
                <span className="text-base text-red-400 mt-1 font-medium leading-tight">
                  Correct answer: <span className="font-bold">{correctAnswerText}</span>
                </span>
              )}
            </div>
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-48 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-xl shadow-sm hover:shadow-md h-12 transition-all active:translate-y-1"
            onClick={onContinue}
          >
            Got it
          </Button>
        </div>
      </div>
    );
  }

  // default / idle
  return (
    <div className="w-full bg-white border-t-2 border-gray-200 p-4 sm:p-6 md:px-8">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Empty div keeps button right-aligned on desktop */}
        <div className="hidden sm:block"></div>
        <Button 
          size="lg" 
          onClick={isLearningSlide ? onContinue : onCheck}
          disabled={disabled}
          className={cn(
            "w-full sm:w-48 font-bold text-lg rounded-xl shadow-sm h-12 transition-all duration-200",
            disabled 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-green-500 hover:bg-green-600 text-white hover:shadow-md border-b-4 border-green-600 active:border-b-0 active:translate-y-1"
          )}
        >
          {isLearningSlide ? "Continue" : "Check"}
        </Button>
      </div>
    </div>
  );
};
