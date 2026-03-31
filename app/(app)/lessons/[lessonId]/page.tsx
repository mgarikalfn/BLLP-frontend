"use client";

import { useLesson } from "@/hooks/useLesson";
import { useParams, useRouter } from "next/navigation";
import { useLessonEngine } from "@/features/lesson/hooks/useLessonEngine";
import { LessonLayout } from "@/features/lesson/components/LessonLayout";
import { VocabCard } from "@/features/lesson/components/VocabCard";
import { MultipleChoiceQuiz } from "@/features/lesson/components/MultipleChoiceQuiz";
import { LessonFooter } from "@/features/lesson/components/LessonFooter";
import { CelebrationScreen } from "@/features/lesson/components/CelebrationScreen";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const { data: lesson, isLoading, error } = useLesson(lessonId);
  const engine = useLessonEngine(lesson);

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
    return <CelebrationScreen xpEarned={10} totalXP={100} />; // TODO: get real values from API
  }

  const { currentSlide, currentIndex, slides, status, selectedOption } = engine;
  const isVocab = currentSlide.type === "learning";
  
  // Calculate correct answer text if incorrect
  let correctAnswerText = undefined;
  if (currentSlide.type === "quiz" && status === "incorrect") {
    const correctIdx = currentSlide.data.correctAnswerIndex;
    correctAnswerText = currentSlide.data.options[correctIdx]?.am;
  }

  return (
    <LessonLayout 
      currentIndex={currentIndex} 
      totalSlides={slides.length} 
      topicId={lesson.topicId}
      footer={
        <LessonFooter
          status={status}
          isLearningSlide={isVocab}
          disabled={!isVocab && selectedOption === null}
          onCheck={engine.checkAnswer}
          onContinue={engine.nextSlide}
          correctAnswerText={correctAnswerText}
        />
      }
    >
      {currentSlide.type === "learning" && (
        <VocabCard key={`vocab-${currentIndex}`} vocab={currentSlide.data} />
      )}
      
      {currentSlide.type === "quiz" && (
        <MultipleChoiceQuiz
          key={`quiz-${currentIndex}`} // Force re-mount on slide change so animations replay
          quiz={currentSlide.data}
          selectedOption={selectedOption}
          onSelect={engine.selectOption}
          status={status}
        />
      )}
    </LessonLayout>
  );
}
