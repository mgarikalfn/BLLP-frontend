import { ChunkyButton } from "@/components/ui/chunky-button";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti"; // Optional: npm install react-confetti

export const SummaryView = () => {
  const router = useRouter();

  return (
    <div className="text-center space-y-8 animate-in zoom-in-95 fade-in">
      {/* <Confetti recycle={false} numberOfPieces={200} /> */}
      <div className="space-y-4">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-black text-slate-800">Topic Completed!</h1>
        <p className="text-slate-500 text-lg">
          You've learned these words. They are now in your <b>Review Queue</b> for tomorrow.
        </p>
      </div>

      <div className="bg-sky-50 border-2 border-sky-100 rounded-3xl p-8 max-w-sm mx-auto">
        <p className="text-sky-600 font-bold text-xl">+15 XP Earned</p>
      </div>

      <ChunkyButton 
        variant="primary" 
        onClick={() => router.push("/dashboard")}
        className="w-full max-w-xs"
      >
        Continue to Dashboard
      </ChunkyButton>
    </div>
  );
};