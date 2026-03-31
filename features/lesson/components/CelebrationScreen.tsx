import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CelebrationScreenProps {
  xpEarned: number;
  totalXP: number;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ xpEarned, totalXP }) => {
  const { width, height } = useWindowSize();
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      <div className="text-center space-y-6 z-10 p-8 bg-card rounded-xl shadow-lg border">
        <h1 className="text-4xl font-bold text-primary">Lesson Completed!</h1>
        <p className="text-xl">Great job! You learned something new.</p>
        
        <div className="flex gap-4 justify-center py-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <span className="block text-sm text-muted-foreground uppercase tracking-wider font-bold">XP Earned</span>
            <span className="block text-3xl font-black text-primary">+{xpEarned}</span>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <span className="block text-sm text-muted-foreground uppercase tracking-wider font-bold">Total XP</span>
            <span className="block text-3xl font-black text-foreground">{totalXP}</span>
          </div>
        </div>
        
        <Button size="lg" className="w-full text-lg" onClick={() => router.back()}>
          Continue
        </Button>
      </div>
    </div>
  );
};
