"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeartModal } from "@/store/useHeartModal";
import { useEconomyStore } from "@/store/useEconomyStore";
import { useLanguageStore } from "@/store/languageStore";

const text = {
  am: {
    title: "ልብ አልቆብሃል!",
    description: "ትምህርት ለመቀጠል ልብ ያስፈልግሃል። የተወሰነ ጊዜ ጠብቅ ወይም በ500 አልማዝ ሙላ።",
    refill: "በ500 አልማዝ ሙሉ",
    practice: "ልምምድ አድርግና ልብ አግኝ",
    close: "በኋላ እመለሳለሁ",
  },
  ao: {
    title: "Onnee ጨረቃ!",
    description: "Barnoota itti fufuuf onnee si barbaachisa. Xiqoo turi ykn diyamondii 500'n guuttadhu.",
    refill: "Diyamondii 500'n guuti",
    practice: "Shaakalii onnee argadhu",
    close: "Booda nan deebi'a",
  },
} as const;

export const HeartRefillModal = () => {
  const router = useRouter();
  const { isOpen, close } = useHeartModal();
  const { gems, refillHeartsWithGems } = useEconomyStore();
  const lang = useLanguageStore((s) => s.lang);
  const t = text[lang];

  if (!isOpen) return null;

  const onRefill = async () => {
    const success = await refillHeartsWithGems();
    if (success) {
      close();
    }
  };

  const onPractice = () => {
    close();
    router.push("/practice");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={close}
      />
      
      <div className="relative w-full max-w-md scale-in-center rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6 h-24 w-24">
            <span className="text-6xl animate-bounce inline-block">💔</span>
          </div>
          
          <h2 className="mb-2 text-2xl font-black text-slate-800">
            {t.title}
          </h2>
          
          <p className="mb-8 text-sm font-semibold text-slate-500">
            {t.description}
          </p>

          <div className="flex w-full flex-col gap-y-3">
            <Button
              onClick={onRefill}
              disabled={gems < 500}
              className="h-12 rounded-2xl border-b-4 border-blue-700 bg-blue-500 text-base font-bold text-white hover:bg-blue-600 active:border-b-0"
            >
              {t.refill}
            </Button>

            <Button
              onClick={onPractice}
              variant="ghost"
              className="h-12 rounded-2xl text-base font-bold text-green-600 hover:bg-green-50"
            >
              {t.practice}
            </Button>

            <Button
              onClick={close}
              variant="ghost"
              className="h-12 rounded-2xl text-base font-semibold text-slate-400 hover:bg-slate-50"
            >
              {t.close}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
