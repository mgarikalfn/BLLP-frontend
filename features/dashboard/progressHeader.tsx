import { Flame, Star } from "lucide-react";

export function ProgressHeader({ user }: { user: any }) {
  return (
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
  );
}