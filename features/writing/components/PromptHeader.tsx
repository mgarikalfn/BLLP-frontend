import { PenSquare } from "lucide-react";

interface PromptHeaderProps {
  instruction: string;
  promptText: string;
  promptTranslation?: string;
}

export const PromptHeader = ({
  instruction,
  promptText,
  promptTranslation,
}: PromptHeaderProps) => {
  return (
    <header className="rounded-2xl border-2 border-sky-100 bg-sky-50/80 p-5">
      <div className="flex items-center gap-2 text-sky-600">
        <PenSquare size={18} />
        <p className="text-xs font-black uppercase tracking-widest">Writing Exercise</p>
      </div>

      <h1 className="mt-3 text-lg font-black text-slate-800">{instruction}</h1>
      <p className="mt-4 text-2xl font-bold leading-snug text-slate-900">{promptText}</p>

      {promptTranslation ? (
        <p className="mt-2 text-sm font-medium text-slate-500">{promptTranslation}</p>
      ) : null}
    </header>
  );
};
