import { BookOpen, Target } from "lucide-react";

export function StatsGrid({ insights, activity }: { insights: any; activity: any }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Activity Card */}
      <div className="border-2 border-[#e5e5e5] rounded-2xl p-5 bg-white flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-[#1cb0f6]" size={24} />
          <h3 className="font-black text-[#afafaf] uppercase text-xs tracking-widest">Today's Focus</h3>
        </div>
        <div>
          <p className="text-xl font-black text-[#4b4b4b]">
            {activity.lessonsToday} <span className="text-sm text-[#afafaf]">Lessons</span>
          </p>
          <p className="text-xl font-black text-[#4b4b4b]">
            {activity.reviewsToday} <span className="text-sm text-[#afafaf]">Reviews</span>
          </p>
        </div>
      </div>

      {/* Weak Topics Card */}
      <div className="border-2 border-[#e5e5e5] rounded-2xl p-5 bg-white flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-[#ff4b4b]" size={24} />
          <h3 className="font-black text-[#afafaf] uppercase text-xs tracking-widest">Weak Spots</h3>
        </div>
        {insights.weakTopics?.length > 0 ? (
          <ul className="space-y-2">
            {insights.weakTopics.slice(0, 2).map((topic: any, idx: number) => (
              <li key={idx} className="flex justify-between items-center font-bold text-[#4b4b4b] bg-[#f7f7f7] px-3 py-2 rounded-xl">
                <span>{topic._id}</span>
                <span className="text-[#ff4b4b] text-sm">{topic.weakCount} words</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-bold text-[#afafaf]">Your memory is rock solid! 🪨</p>
        )}
      </div>
    </section>
  );
}