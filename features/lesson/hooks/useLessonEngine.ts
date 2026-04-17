import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Lesson, VocabularyItem, LessonQuestion } from '@/types/learning';
import { normalizeQuestion } from '@/features/lesson/components/QuestionHost';
import { api } from '@/lib/api';

export type Slide = 
  | { type: 'study'; data: { grammarNotes?: Lesson['grammarNotes']; dialogue?: Lesson['dialogue'] } }
  | { type: 'learning'; data: VocabularyItem }
  | { type: 'quiz'; data: LessonQuestion };

export type LessonStatus = 'idle' | 'checking' | 'correct' | 'incorrect' | 'completed' | 'celebration';

export const useLessonEngine = (lesson?: Lesson) => {
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<LessonStatus>('idle');

  // Initialize slides when lesson loads
  useEffect(() => {
    if (lesson) {
      const hasStudyContent = Boolean(lesson.grammarNotes) || Boolean(lesson.dialogue && lesson.dialogue.length > 0);
      const studySlides: Slide[] = hasStudyContent
        ? [
            {
              type: 'study',
              data: {
                grammarNotes: lesson.grammarNotes,
                dialogue: lesson.dialogue,
              },
            },
          ]
        : [];
      const vocabSlides: Slide[] = (lesson.vocabulary || []).map(v => ({ type: 'learning', data: v }));
      const quizSlides: Slide[] = (lesson.quiz || []).map(q => ({ type: 'quiz', data: normalizeQuestion(q) }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlides([...studySlides, ...vocabSlides, ...quizSlides]);
      setCurrentIndex(0);
      setStatus('idle');
    }
  }, [lesson]);

  const currentSlide = slides[currentIndex];

  const checkAnswer = () => {
    if (!currentSlide) return;

    if (currentSlide.type === 'learning') {
      nextSlide();
      return;
    }
  };

  const completeQuestion = (isCorrect: boolean) => {
    if (!currentSlide || currentSlide.type !== 'quiz') return;

    setStatus(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      // Push a copy to the end of the line so they must do it again
      setSlides(prev => [...prev, currentSlide]);
    }
  };

  const nextSlide = async () => {
    if (currentIndex + 1 >= slides.length) {
      if (lesson?._id) {
        try {
          await api.post('/learn/complete', { lessonId: lesson._id });
          queryClient.invalidateQueries({ queryKey: ["topicWorkspace"] });
        } catch (e) {
          console.error("Failed to complete lesson", e);
        }
      }
      setStatus('celebration');
    } else {
      setCurrentIndex(prev => prev + 1);
      setStatus('idle');
    }
  };

  return {
    slides,
    currentIndex,
    currentSlide,
    status,
    checkAnswer,
    completeQuestion,
    nextSlide
  };
};
