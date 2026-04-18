"use client";

import { useLesson } from "@/hooks/useLesson";
import { useParams, useRouter } from "next/navigation";
import { useLessonEngine } from "@/features/lesson/hooks/useLessonEngine";
import { LessonLayout } from "@/features/lesson/components/LessonLayout";
import { VocabCard } from "@/features/lesson/components/VocabCard";
import { QuestionHost } from "@/features/lesson/components/QuestionHost";
import { LessonFooter } from "@/features/lesson/components/LessonFooter";
import { CelebrationScreen } from "@/features/lesson/components/CelebrationScreen";
import { StudyMomentCard } from "@/features/lesson/components/StudyMomentCard";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

const resolveMaybeLocalizedText = (
  value: string | { am?: string; ao?: string } | undefined,
  lang: "am" | "ao"
) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value[lang] ?? value.am ?? value.ao;
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const engine = useLessonEngine(lesson);
  const lang = useLanguageStore((state) => state.lang);

  useEffect(() => {
    if (engine.status === "completed") {
      // TODO: Make an API call here to save progress 
      // POST /api/user/progress
      
      // Redirect back to topics using the topic ID, or general learn page
      router.push(lesson?.topicId ? `/topics/${lesson.topicId}` : "/learn");
    }
  }, [engine.status, router, lesson?.topicId]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white gap-4">
        <h2 className="text-xl font-bold text-gray-700">Failed to load lesson</h2>
        <button 
          onClick={() => router.back()} 
          className="text-white bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-xl font-bold transition-all active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  // If there are no slides, or we finished (and are waiting for redirect)
  if (engine.slides.length === 0 || engine.status === "completed") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  if (engine.status === "celebration") {
    return <CelebrationScreen xpEarned={10} totalXP={100} debugError={engine.completionError} />; // TODO: get real values from API
  }

  const { currentSlide, currentIndex, slides, status } = engine;
  const isLearningSlide = currentSlide.type === "learning" || currentSlide.type === "study";
  
  // Calculate correct answer text if incorrect
  let correctAnswerText = undefined;
  if (currentSlide.type === "quiz" && status === "incorrect") {
    const content = currentSlide.data.content as {
      correctIndex?: number;
      correctAnswerIndex?: number;
      options?: Array<{ am?: string; ao?: string } | string>;
      answer?: string;
      correctSentence?: string;
      correctAnswer?: { am?: string; ao?: string } | string;
    };

    if (currentSlide.data.type === "MULTIPLE_CHOICE") {
      const correctIdx = content.correctIndex ?? content.correctAnswerIndex ?? -1;
      const rawCorrect = content.options?.[correctIdx];
      correctAnswerText = resolveMaybeLocalizedText(rawCorrect, lang);
    }

    if (currentSlide.data.type === "SCRAMBLE") {
      correctAnswerText = content.correctSentence ?? content.answer;
    }

    if (currentSlide.data.type === "CLOZE") {
      correctAnswerText = resolveMaybeLocalizedText(content.correctAnswer, lang);
    }
  }

  return (
    <>
      {engine.completionError ? (
        <div className="fixed top-4 left-1/2 z-[60] w-[92%] max-w-2xl -translate-x-1/2 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg">
          Progress save failed: {engine.completionError}
        </div>
      ) : null}

      <LessonLayout 
        currentIndex={currentIndex} 
        totalSlides={slides.length} 
        topicId={lesson.topicId}
        footer={
          <LessonFooter
            status={status}
            isLearningSlide={isLearningSlide}
            disabled={!isLearningSlide}
            onCheck={engine.checkAnswer}
            onContinue={engine.nextSlide}
            correctAnswerText={correctAnswerText}
          />
        }
      >
        {currentSlide.type === "study" && (
          <StudyMomentCard
            key={`study-${currentIndex}`}
            grammarNotes={currentSlide.data.grammarNotes}
            dialogue={currentSlide.data.dialogue}
          />
        )}

        {currentSlide.type === "learning" && (
          <VocabCard key={`vocab-${currentIndex}`} vocab={currentSlide.data} />
        )}
        
        {currentSlide.type === "quiz" && (
          <QuestionHost
            key={`quiz-${currentIndex}`} // Force re-mount on slide change so animations replay
            question={currentSlide.data}
            onComplete={engine.completeQuestion}
            disabled={status !== "idle"}
          />
        )}
      </LessonLayout>
    </>
  );
}
