"use client";

import { Heart, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/languageStore";

interface OutOfHeartsModalProps {
  open: boolean;
  gems: number;
  isRefilling: boolean;
  error?: string | null;
  onClose: () => void;
  onRefill: () => void;
  onPractice: () => void;
}

const modalText = {
  am: {
    title: "ልብ አልቆብሃል",
    description: "ትምህርት ለመጀመር ልብ ያስፈልግሃል።",
    gems: "አልማዝ",
    refilling: "እየሞላ ነው...",
    refillBtn: "በ500 አልማዝ ሙሉ",
    practiceBtn: "በልምምድ ልብ አግኝ",
    close: "ዝጋ",
  },
  ao: {
    title: "Onnee Dhumeera",
    description: "Barnoota eegaluuf onnee si barbaachisa.",
    gems: "Diyamondii",
    refilling: "Guutamaa jira...",
    refillBtn: "Diyamondii 500'n guuti",
    practiceBtn: "Shaakaluun onnee argadhu",
    close: "Cufi",
  },
} as const;

export function OutOfHeartsModal({
  open,
  gems,
  isRefilling,
  error,
  onClose,
  onRefill,
  onPractice,
}: OutOfHeartsModalProps) {
  const lang = useLanguageStore((s) => s.lang);
  const t = modalText[lang];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Heart size={22} />
          </span>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{t.title}</h2>
            <p className="text-sm font-medium text-slate-500">{t.description}</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Gem size={16} className="text-sky-500" />
            {t.gems}: <span className="font-black text-slate-800">{gems}</span>
          </span>
        </div>

        {error ? <p className="mb-3 text-sm font-semibold text-rose-600">{error}</p> : null}

        <div className="space-y-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full h-12 text-base font-bold text-white bg-blue-500 border-b-4 border-blue-700 active:border-b-0 hover:bg-blue-600"
            onClick={onRefill}
            disabled={isRefilling}
          >
            {isRefilling ? t.refilling : t.refillBtn}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full h-12 text-base font-bold"
            onClick={onPractice}
          >
            {t.practiceBtn}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full pt-1 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
