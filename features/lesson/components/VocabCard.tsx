import { Volume2 } from "lucide-react";
import { VocabularyItem } from "@/types/learning";

interface VocabCardProps {
  vocab: VocabularyItem;
}

export const VocabCard = ({ vocab }: VocabCardProps) => {
  const getAudioUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    return `${baseUrl}${path}`;
  };

  const playAudio = (path?: string) => {
    const url = getAudioUrl(path);
    if (url) {
      const audio = new Audio(url);
      audio.play();
    } else {
      console.warn("No audio URL available.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-6xl font-black text-gray-800 mb-4 flex items-center justify-center gap-4">
          {vocab.am}
          {vocab.audioUrl?.am && (
            <button 
              onClick={() => playAudio(vocab.audioUrl?.am)} 
              className="text-blue-500 hover:bg-blue-50 p-3 rounded-full transition-colors active:scale-95"
              aria-label="Play Amharic audio"
            >
              <Volume2 size={36} strokeWidth={2.5} />
            </button>
          )}
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-500 flex items-center justify-center gap-2">
          {vocab.ao}
          {vocab.audioUrl?.ao && (
            <button 
              onClick={() => playAudio(vocab.audioUrl?.ao)} 
              className="text-orange-500 hover:bg-orange-50 p-2 rounded-full transition-colors active:scale-95"
              aria-label="Play Afan Oromo audio"
            >
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
          )}
        </h2>
      </div>

      {vocab.example && (
        <div className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Example Context</h3>
          <h4 className="flex items-center gap-2">
            <span className="text-xl text-gray-700 font-medium mb-2">{vocab.example.am}</span>
            {vocab.example.audioUrl?.am && (
              <button 
                onClick={() => playAudio(vocab.example?.audioUrl?.am)} 
                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors active:scale-95 -mt-2"
                aria-label="Play example Amharic audio"
              >
                <Volume2 size={20} strokeWidth={2.5} />
              </button>
            )}
          </h4>
          <p className="flex items-center gap-2">
            <span className="text-lg text-gray-500">{vocab.example.ao}</span>
            {vocab.example.audioUrl?.ao && (
               <button 
                 onClick={() => playAudio(vocab.example?.audioUrl?.ao)} 
                 className="text-orange-500 hover:bg-orange-50 p-1.5 rounded-full transition-colors active:scale-95"
                 aria-label="Play example Afan Oromo audio"
               >
                 <Volume2 size={18} strokeWidth={2.5} />
               </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
