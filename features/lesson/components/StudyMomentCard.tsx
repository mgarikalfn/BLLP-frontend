import { BookOpenText, Lightbulb } from "lucide-react";
import { Lesson } from "@/types/learning";
import { useLanguageStore } from "@/store/languageStore";

interface StudyMomentCardProps {
  grammarNotes?: Lesson["grammarNotes"];
  dialogue?: Lesson["dialogue"];
}

export const StudyMomentCard = ({ grammarNotes, dialogue = [] }: StudyMomentCardProps) => {
  const targetLanguage = useLanguageStore((state) => state.lang);
  const helperLanguage = targetLanguage === "am" ? "ao" : "am";

  const title = targetLanguage === "am" ? "የማጥናት ጊዜ" : "Yeroo Qo'annoo";
  const subtitle =
    targetLanguage === "am"
      ? "በፊት ያስቡ፣ ከዚያ ልምምድ ይጀምሩ"
      : "Dura hubadhu, itti aansuun shaakali";

  const grammarTitle = targetLanguage === "am" ? "የሰዋሰው ማብራሪያ" : "Ibsa Seerluga";
  const dialogueTitle = targetLanguage === "am" ? "ምሳሌ ውይይት" : "Fakkeenya Marii";
  const translationLabel = targetLanguage === "am" ? "ትርጉም" : "Hiika";

  const targetGrammarText = grammarNotes?.[targetLanguage] || grammarNotes?.am || grammarNotes?.ao || "";
  const helperGrammarText = grammarNotes?.[helperLanguage] || "";

  const hasGrammar = Boolean(grammarNotes);
  const hasDialogue = dialogue.length > 0;

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300 space-y-5">
      <section className="rounded-3xl border-2 border-amber-200 bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 p-5 shadow-[0_12px_40px_rgba(245,158,11,0.12)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-700">
              <Lightbulb size={14} />
              Pro Tip
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-800 sm:text-3xl">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">{subtitle}</p>
          </div>
          <div className="hidden rounded-2xl bg-white/70 p-3 text-amber-700 sm:block">
            <BookOpenText size={28} />
          </div>
        </div>
      </section>

      {hasGrammar ? (
        <section className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/70 p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">{grammarTitle}</h3>
          <p className="mt-2 text-lg font-bold leading-relaxed text-slate-800">{targetGrammarText}</p>
          {helperGrammarText && helperGrammarText !== targetGrammarText ? (
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
              {translationLabel}: {helperGrammarText}
            </p>
          ) : null}
        </section>
      ) : null}

      {hasDialogue ? (
        <section className="rounded-2xl border-2 border-sky-100 bg-white p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-sky-600">{dialogueTitle}</h3>
          <div className="mt-3 space-y-3">
            {dialogue.map((line, index) => (
              <div key={line._id || `${line.speaker}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{line.speaker}</p>
                <p className="mt-1 text-base font-bold text-slate-800">{line.text[targetLanguage]}</p>
                {line.text[helperLanguage] && line.text[helperLanguage] !== line.text[targetLanguage] ? (
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {translationLabel}: {line.text[helperLanguage]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
