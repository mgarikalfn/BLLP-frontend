"use client";

export default function Header() {

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      {/* Search */}
      <input
        placeholder="Search..."
        className="border rounded-lg px-3 py-1 text-sm"
      />

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">

        <div>🔥 3</div>
        <div>⭐ 420 XP</div>
        <div>🏆 Level 4</div>

        <div className="w-8 h-8 rounded-full bg-gray-300" />

      </div>

    </header>
  );
}