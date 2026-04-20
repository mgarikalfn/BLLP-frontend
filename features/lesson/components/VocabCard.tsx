import { Volume2 } from "lucide-react";
import { VocabularyItem } from "@/types/learning";
import { useLanguageStore } from "@/store/languageStore";
import { useDictionaryStore } from "@/store/useDictionaryStore";

interface VocabCardProps {
  vocab: VocabularyItem;
  topicId?: string;
}

export const VocabCard = ({ vocab, topicId }: VocabCardProps) => {
  const nativeLanguage = useLanguageStore((state) => state.lang);
  const targetLanguage = useLanguageStore((state) => state.targetLang);
  const openDictionary = useDictionaryStore((state) => state.openDictionary);

  const primaryWord = vocab[targetLanguage];
  const secondaryWord = vocab[nativeLanguage];
  const primaryAudio = vocab.audioUrl?.[targetLanguage];
  const secondaryAudio = vocab.audioUrl?.[nativeLanguage];

  const primaryAudioLabel =
    targetLanguage === "am" ? "Play Amharic audio" : "Play Afan Oromo audio";
  const secondaryAudioLabel =
    nativeLanguage === "am" ? "Play Amharic audio" : "Play Afan Oromo audio";

  const examplePrimaryText = vocab.example?.[targetLanguage];
  const exampleSecondaryText = vocab.example?.[nativeLanguage];
  const examplePrimaryAudio = vocab.example?.audioUrl?.[targetLanguage];
  const exampleSecondaryAudio = vocab.example?.audioUrl?.[nativeLanguage];

  const examplePrimaryLabel =
    targetLanguage === "am" ? "Play example Amharic audio" : "Play example Afan Oromo audio";
  const exampleSecondaryLabel =
    nativeLanguage === "am" ? "Play example Amharic audio" : "Play example Afan Oromo audio";

  const exampleContextTitle = targetLanguage === "am" ? "የአጠቃቀም ምሳሌ" : "Fakkeenya Haala Itti Fayyadamaa";

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
          <button
            type="button"
            onClick={() => {
              if (primaryWord) {
                void openDictionary(primaryWord, topicId);
              }
            }}
            className="rounded-md border-b-2 border-dotted border-sky-400 px-1 text-left text-sky-700 decoration-sky-400 underline-offset-4 transition hover:bg-sky-100/70"
            title={targetLanguage === "am" ? "Open dictionary" : "Galmee jechootaa bani"}
          >
            {primaryWord}
          </button>
          {primaryAudio && (
            <button 
              onClick={() => playAudio(primaryAudio)} 
              className="text-blue-500 hover:bg-blue-50 p-3 rounded-full transition-colors active:scale-95"
              aria-label={primaryAudioLabel}
            >
              <Volume2 size={36} strokeWidth={2.5} />
            </button>
          )}
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-500 flex items-center justify-center gap-2">
          {secondaryWord}
          {secondaryAudio && (
            <button 
              onClick={() => playAudio(secondaryAudio)} 
              className="text-orange-500 hover:bg-orange-50 p-2 rounded-full transition-colors active:scale-95"
              aria-label={secondaryAudioLabel}
            >
              <Volume2 size={24} strokeWidth={2.5} />
            </button>
          )}
        </h2>
      </div>

      {vocab.example && (
        <div className="w-full bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{exampleContextTitle}</h3>
          <h4 className="flex items-center gap-2">
            <span className="text-xl text-gray-700 font-bold mb-2">{examplePrimaryText}</span>
            {examplePrimaryAudio && (
              <button 
                onClick={() => playAudio(examplePrimaryAudio)} 
                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors active:scale-95 -mt-2"
                aria-label={examplePrimaryLabel}
              >
                <Volume2 size={20} strokeWidth={2.5} />
              </button>
            )}
          </h4>
          <p className="flex items-center gap-2">
            <span className="text-lg text-gray-500">{exampleSecondaryText}</span>
            {exampleSecondaryAudio && (
               <button 
                 onClick={() => playAudio(exampleSecondaryAudio)} 
                 className="text-orange-500 hover:bg-orange-50 p-1.5 rounded-full transition-colors active:scale-95"
                 aria-label={exampleSecondaryLabel}
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
