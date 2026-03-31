import { Volume2 } from "lucide-react";
import { VocabularyItem } from "@/types/learning";

interface VocabCardProps {
  vocab: VocabularyItem;
}

export const VocabCard = ({ vocab }: VocabCardProps) => {
  const playAudio = () => {
    if (vocab.audioUrl) {
      const audio = new Audio(vocab.audioUrl);
      audio.play();
    } else {
      console.warn("No audio URL available for this vocabulary item.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-6xl font-black text-gray-800 mb-4 flex items-center justify-center gap-4">
          {vocab.am}
          <button 
            onClick={playAudio} 
            className="text-blue-500 hover:bg-blue-50 p-3 rounded-full transition-colors active:scale-95"
            aria-label="Play audio"
          >
            <Volume2 size={36} strokeWidth={2.5} />
          </button>
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-500">{vocab.ao}</h2>
      </div>

      {vocab.example && (
        <div className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Example Context</h3>
          <p className="text-xl text-gray-700 font-medium mb-2">{vocab.example.am}</p>
          <p className="text-lg text-gray-500">{vocab.example.ao}</p>
        </div>
      )}
    </div>
  );
};
