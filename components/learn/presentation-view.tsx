import { Lesson } from "@/types/study";
import { ChunkyButton } from "@/components/ui/chunky-button";
import { useLearnStore } from "@/store/user-learn-store";

export const PresentationView = ({ lesson }: { lesson: Lesson }) => {
  const { nextStep, nativeLang, learningLang } = useLearnStore();

  return (
    <div className="w-full flex flex-col items-center gap-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-4">
        <p className="text-slate-400 font-bold uppercase tracking-widest">New Word</p>
        {/* The language they are learning (Afaan Oromo) */}
        <h1 className="text-6xl font-black text-slate-800">
          {lesson.content[learningLang]}
        </h1>
        {/* The translation (Amharic) */}
        <p className="text-2xl text-slate-500 font-medium">
          {lesson.content[nativeLang]}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <ChunkyButton onClick={nextStep} variant="primary" className="w-full text-xl py-6">
          I've Got It
        </ChunkyButton>
      </div>
    </div>
  );
};