import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
//import { ChunkyButton } from "@/components/ui/chunky-button";

export function UnitCard({ actions, level }: { actions: any; level: number }) {
  const isReview = actions.isReviewPriority;

  return (
    <section>
      <div className={cn(
        "rounded-3xl p-8 text-white border-b-8 relative overflow-hidden transition-all",
        isReview ? "bg-sky border-blue-700" : "bg-bird border-green-700" // using your tailwind colors
      )}>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-black opacity-80 uppercase tracking-[0.2em]">
              {isReview ? "Maintenance" : `Unit ${level}`}
            </h2>
            <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-sm">
              {isReview 
                ? "Retention Session" 
                : `Master: "${actions.recommendedLesson?.title.am || 'Next Lesson'}"`}
            </h1>
            <p className="text-lg font-bold opacity-90">
              {isReview 
                ? `You have ${actions.dueCount} words weakening.` 
                : `Learn the Oromo translation.`}
            </p>
          </div>

          <Link href={isReview ? "/review" : `/learn/${actions.recommendedLesson?._id}`}>
            <Button 
              variant="primary" 
              className="w-full md:w-auto bg-white text-[#4b4b4b] border-[#e5e5e5] hover:bg-[#f7f7f7] text-xl px-12 py-4 mt-2"
            >
              <span className="flex items-center justify-center gap-2">
                {isReview ? "Start Review" : "Continue Path"}
                <ChevronRight size={24} strokeWidth={3} />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}