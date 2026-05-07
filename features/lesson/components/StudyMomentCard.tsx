import { BookOpenText, Lightbulb } from "lucide-react";
import { Lesson } from "@/types/learning";
import { useLanguageStore } from "@/store/languageStore";

interface StudyMomentCardProps {
  grammarNotes?: Lesson["grammarNotes"];
  dialogue?: Lesson["dialogue"];
}

export const StudyMomentCard = ({ grammarNotes, dialogue = [] }: StudyMomentCardProps) => {
  // lang = the user's native / UI language
  const nativeLang = useLanguageStore((state) => state.lang);
  const fallbackLang = nativeLang === "am" ? "ao" : "am";

  const title = nativeLang === "am" ? "የማጥናት ጊዜ" : "Yeroo Qo'annoo";
  const subtitle =
    nativeLang === "am"
      ? "በፊት ያስቡ፣ ከዚያ ልምምድ ይጀምሩ"
      : "Dura hubadhu, itti aansuun shaakali";

  const grammarTitle = nativeLang === "am" ? "የሰዋሰው ማብራሪያ" : "Ibsa Seerluga";
  const dialogueTitle = nativeLang === "am" ? "ምሳሌ ውይይት" : "Fakkeenya Marii";

  // Show ONLY the user's native language — no helper translation
  const grammarText =
    grammarNotes?.[nativeLang] || grammarNotes?.[fallbackLang] || "";

  const hasGrammar = Boolean(grammarText);
  const hasDialogue = dialogue.length > 0;

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-300 space-y-4">

      {/* ── Header card ── */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 flex items-center gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
          <Lightbulb size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600">
            Study Moment
          </p>
          <h2 className="text-lg font-black text-slate-800 leading-tight">{title}</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="ml-auto hidden sm:block text-amber-200 shrink-0">
          <BookOpenText size={32} />
        </div>
      </section>

      {/* ── Grammar notes — native language only ── */}
      {hasGrammar ? (
        <section className="rounded-2xl border border-indigo-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 rounded-full bg-indigo-500 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">
              {grammarTitle}
            </h3>
          </div>
          <p className="text-base font-semibold leading-relaxed text-slate-700 whitespace-pre-line">
            {grammarText}
          </p>
        </section>
      ) : null}

      {/* ── Dialogue — native language only ── */}
      {hasDialogue ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 rounded-full bg-sky-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-widest text-sky-600">
              {dialogueTitle}
            </h3>
          </div>
          <div className="space-y-2">
            {dialogue.map((line, index) => (
              <div
                key={line._id || `${line.speaker}-${index}`}
                className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
              >
                <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                  {(line.speaker?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {line.speaker}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {line.text[nativeLang] || line.text[fallbackLang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
