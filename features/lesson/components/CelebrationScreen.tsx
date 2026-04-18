import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/translations';
import { useLanguageStore } from '@/store/languageStore';

interface CelebrationScreenProps {
  xpEarned: number;
  totalXP: number;
  debugError?: string | null;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ xpEarned, totalXP, debugError }) => {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const lang = useLanguageStore((s) => s.lang);
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      <div className="text-center space-y-6 z-10 p-8 bg-card rounded-xl shadow-lg border">
        <h1 className="text-4xl font-bold text-primary">{t.lessonCompleted}</h1>
        <p className="text-xl">{t.greatJob}</p>

        {debugError ? (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700">
            Progress save failed: {debugError}
          </div>
        ) : null}
        
        <div className="flex gap-4 justify-center py-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <span className="block text-sm text-muted-foreground uppercase tracking-wider font-bold">{t.xpEarned}</span>
            <span className="block text-3xl font-black text-primary">+{xpEarned}</span>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <span className="block text-sm text-muted-foreground uppercase tracking-wider font-bold">{t.totalXP}</span>
            <span className="block text-3xl font-black text-foreground">{totalXP}</span>
          </div>
        </div>
        
        <Button size="lg" className="w-full text-lg" onClick={() => router.back()}>
          {t.continue}
        </Button>
      </div>
    </div>
  );
};
