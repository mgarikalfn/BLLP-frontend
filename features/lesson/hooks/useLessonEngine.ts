import { useState, useEffect } from 'react';
import { Lesson, VocabularyItem, QuizQuestion } from '@/types/learning';
import { api } from '@/lib/api';

export type Slide = 
  | { type: 'learning'; data: VocabularyItem }
  | { type: 'quiz'; data: QuizQuestion };

export type LessonStatus = 'idle' | 'checking' | 'correct' | 'incorrect' | 'completed' | 'celebration';

export const useLessonEngine = (lesson?: Lesson) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<LessonStatus>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Initialize slides when lesson loads
  useEffect(() => {
    if (lesson) {
      const vocabSlides: Slide[] = (lesson.vocabulary || []).map(v => ({ type: 'learning', data: v }));
      const quizSlides: Slide[] = (lesson.quiz || []).map(q => ({ type: 'quiz', data: q }));
      setSlides([...vocabSlides, ...quizSlides]);
      setCurrentIndex(0);
      setStatus('idle');
      setSelectedOption(null);
    }
  }, [lesson?._id]);

  const currentSlide = slides[currentIndex];

  const selectOption = (index: number) => {
    // Prevent changing answer once submitted
    if (status !== 'idle' && status !== 'checking') return; 
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (!currentSlide) return;

    if (currentSlide.type === 'learning') {
      nextSlide();
      return;
    }

    if (currentSlide.type === 'quiz') {
      const isCorrect = selectedOption === currentSlide.data.correctAnswerIndex;
      setStatus(isCorrect ? 'correct' : 'incorrect');

      if (!isCorrect) {
        // Push a copy to the end of the line so they must do it again
        setSlides(prev => [...prev, currentSlide]);
      }
    }
  };

  const nextSlide = async () => {
    if (currentIndex + 1 >= slides.length) {
      if (lesson?._id) {
        try {
          await api.post('/learn/complete', { lessonId: lesson._id });
        } catch (e) {
          console.error("Failed to complete lesson", e);
        }
      }
      setStatus('celebration');
    } else {
      setCurrentIndex(prev => prev + 1);
      setStatus('idle');
      setSelectedOption(null);
    }
  };

  return {
    slides,
    currentIndex,
    currentSlide,
    status,
    selectedOption,
    selectOption,
    checkAnswer,
    nextSlide
  };
};
