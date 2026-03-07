"use client";

import Link from "next/link";
import { Home, BookOpen, Brain, Trophy } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Topics", href: "/topics", icon: BookOpen },
  { name: "Study", href: "/study", icon: Brain },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export default function Sidebar() {

  return (
    <aside className="w-64 bg-white border-r flex flex-col">

      {/* Logo */}
      <div className="p-6 font-bold text-xl">
        LangBridge
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">

        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}

      </nav>

      {/* User Section */}
      <div className="p-4 border-t">

        <div className="text-sm font-medium">
          User
        </div>

        <button className="text-red-500 text-sm mt-2">
          Logout
        </button>

      </div>

    </aside>
  );
}