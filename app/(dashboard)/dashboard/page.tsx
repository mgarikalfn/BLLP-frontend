import { Flame, Trophy, Star, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ChunkyButton } from "@/components/ui/chunky-button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const response = await fetch(`http://localhost:5000/api/dashboard`, {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTAzZWNhYjUzMTNiNjEwODQ2ODNhNCIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MjU0OTc0MSwiZXhwIjoxNzcyNTUzMzQxfQ.PPmvpOakwBRa0WWnjNTZ7nJN-xfLAY9zXKVY5dHVePc` }
  });
  
  const res = await response.json();
  if (!res.success) return <div className="p-10 text-center font-black">Error loading brain...</div>;

  const { user, actions, insights } = res.data;

  return (
    <div className="min-h-screen bg-white text-[#4b4b4b] font-sans pb-20">
      {/* 1. DUO-STYLE HEADER */}
      <nav className="sticky top-0 z-10 bg-white border-b-2 border-[#e5e5e5] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame size={28} className="text-[#ff9600]" fill="#ff9600" />
              <span className="text-lg font-black text-[#ff9600]">{user.streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={28} className="text-[#ffc800]" fill="#ffc800" />
              <span className="text-lg font-black text-[#ffc800]">{user.xp}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block font-black text-[#afafaf] uppercase text-xs tracking-tighter">
              {user.tier} League
            </span>
            <div className="w-10 h-10 rounded-full bg-[#ce82ff] border-b-4 border-[#a556d8]" />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6 mt-4 space-y-10">
        
        {/* 2. THE UNIT CARD (Tactile Mission) */}
        <section>
          <div className={cn(
            "rounded-3xl p-8 text-white border-b-8 relative overflow-hidden transition-all",
            actions.isReviewPriority ? "bg-sky border-blue-700" : "bg-bird border-green-700"
          )}>
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm font-black opacity-70 uppercase tracking-[0.2em]">
                  {actions.isReviewPriority ? "Maintenance" : `Unit ${user.level}`}
                </h2>
                <h1 className="text-3xl md:text-4xl font-black leading-tight">
                  {actions.isReviewPriority 
                    ? "Retention Session" 
                    : `Master: "${actions.recommendedLesson.content.am}"`}
                </h1>
                <p className="text-lg font-bold opacity-90">
                  {actions.isReviewPriority 
                    ? `You have ${actions.dueCount} words to review.` 
                    : `Learn the Oromo word for "${actions.recommendedLesson.content.ao}"`}
                </p>
              </div>

              {/* Integrating your ChunkyButton */}
              <a 
                href={actions.isReviewPriority ? "/review" : `/learn/${actions.recommendedLesson._id}`}
                className="block w-full md:w-fit"
              >
                <ChunkyButton 
                  variant="primary" 
                  className="w-full md:w-auto bg-white text-[#4b4b4b] border-[#e5e5e5] hover:bg-[#f7f7f7] text-xl px-12 py-4"
                >
                  <span className="flex items-center justify-center gap-2">
                    {actions.isReviewPriority ? "Start Review" : "Continue"}
                    <ChevronRight size={24} strokeWidth={3} />
                  </span>
                </ChunkyButton>
              </a>
            </div>
          </div>
        </section>

        {/* 3. TACTILE STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard 
            title="Daily Progress" 
            value="85%" 
            variant="warning"
            icon={<Trophy size={20} fill="currentColor" />} 
          />
          <StatsCard 
            title="Weak Topics" 
            value={insights.weakTopics.length > 0 ? insights.weakTopics.length : "Clean!"} 
            variant="danger"
            icon={<BookOpen size={20} fill="currentColor" />} 
          />
        </section>

        {/* 4. LEAGUE STATUS CARD */}
        <div className="border-2 border-[#e5e5e5] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 bg-[#f7f7f7]">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border-2 border-[#e5e5e5] flex items-center justify-center">
             <Star className="text-[#afafaf]" size={32} />
          </div>
          <h3 className="font-black text-[#4b4b4b] text-lg uppercase tracking-tight">League Insights</h3>
          <p className="text-sm font-bold text-[#afafaf] max-w-xs">
            Complete a few more lessons to see your rank in the <span className="text-[#ce82ff]">{user.tier} League</span>.
          </p>
        </div>

      </main>
    </div>
  );
}