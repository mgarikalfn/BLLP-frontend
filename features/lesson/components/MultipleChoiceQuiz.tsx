import { QuizQuestion } from "@/types/learning";
import { cn } from "@/lib/utils";

interface MultipleChoiceQuizProps {
  quiz: QuizQuestion;
  selectedOption: number | null;
  onSelect: (index: number) => void;
  status: "idle" | "checking" | "correct" | "incorrect" | "completed";
}

export const MultipleChoiceQuiz = ({
  quiz,
  selectedOption,
  onSelect,
  status,
}: MultipleChoiceQuizProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 self-start mb-8 pl-2">
        {quiz.question.am}
        <span className="block text-xl text-gray-400 font-medium mt-2">{quiz.question.ao}</span>
      </h2>

      <div className="grid grid-cols-1 gap-4 w-full">
        {quiz.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = status === "correct" && isSelected;
          const isIncorrect = status === "incorrect" && isSelected;
          const showCorrectAnswer = status === "incorrect" && index === quiz.correctAnswerIndex;

          return (
            <button
              key={option._id || index}
              onClick={() => onSelect(index)}
              disabled={status === "correct" || status === "incorrect"}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 border-b-4 transition-all duration-150 outline-none",
                !isSelected && status === "idle" && "active:border-b-0 active:translate-y-1",
                isSelected
                  ? "border-blue-400 bg-blue-50 text-blue-500"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
                isCorrect && "border-green-500 bg-green-50 text-green-600",
                isIncorrect && "border-red-500 bg-red-50 text-red-600 border-b-2 translate-y-1",
                showCorrectAnswer && "border-green-500 bg-green-50 text-green-600"
              )}
            >
              <span className="block text-xl font-bold mb-1">{option.am}</span>
              <span className="block text-md font-medium opacity-80">{option.ao}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
