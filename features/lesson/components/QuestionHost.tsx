import { LegacyQuizQuestion, LessonQuestion, LocalizedOrString, MatchingQuestionContent, MultipleChoiceQuestionContent, ScrambleQuestionContent, ClozeQuestionContent } from "@/types/learning";
import { useLanguageStore } from "@/store/languageStore";
import { MultipleChoice } from "./questions/MultipleChoice";
import { MatchingGame } from "./questions/MatchingGame";
import { SentenceScramble } from "./questions/SentenceScramble";
import { ClozeTest } from "./questions/ClozeTest";

interface QuestionHostProps {
  question: LessonQuestion;
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const toDisplayText = (value: LocalizedOrString | undefined, lang: "am" | "ao"): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.am ?? value.ao ?? "";
};

const isLegacyQuizQuestion = (question: LessonQuestion | LegacyQuizQuestion): question is LegacyQuizQuestion => {
  return (question as LegacyQuizQuestion).question !== undefined;
};

export const normalizeQuestion = (question: LessonQuestion | LegacyQuizQuestion): LessonQuestion => {
  if (isLegacyQuizQuestion(question)) {
    return {
      _id: question._id,
      type: "MULTIPLE_CHOICE",
      content: {
        question: question.question,
        options: question.options,
        correctAnswerIndex: question.correctAnswerIndex,
      },
    };
  }

  return question;
};

export const QuestionHost = ({ question, onComplete, disabled = false }: QuestionHostProps) => {
  const nativeLanguage = useLanguageStore((state) => state.lang);
  const targetLanguage = useLanguageStore((state) => state.targetLang);

  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoice
          content={question.content as MultipleChoiceQuestionContent}
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          onComplete={onComplete}
          disabled={disabled}
        />
      );

    case "MATCHING":
      return (
        <MatchingGame
          content={question.content as MatchingQuestionContent}
          language={targetLanguage}
          onComplete={onComplete}
          disabled={disabled}
        />
      );

    case "SCRAMBLE":
      return (
        <SentenceScramble
          key={question._id || JSON.stringify(question.content)}
          content={question.content as ScrambleQuestionContent}
          language={targetLanguage}
          onComplete={onComplete}
          disabled={disabled}
        />
      );

    case "CLOZE":
      return (
        <ClozeTest
          content={question.content as ClozeQuestionContent}
          language={targetLanguage}
          onComplete={onComplete}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          Unsupported question type.
        </div>
      );
  }
};
