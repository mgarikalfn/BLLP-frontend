"use client";

import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileHeader } from "@/features/profile/ProfileHeader";
import { StatisticsGrid } from "@/features/profile/StatisticsGrid";
import { AchievementsWall } from "@/features/profile/AchievementsWall";
import { useLanguageStore } from "@/store/languageStore";
import { useRouter } from "next/navigation";

export default function ProfileClient() {
  const { data, isLoading, isError } = useProfile();
  const lang = useLanguageStore((state) => state.lang);
  const router = useRouter();

  const text = {
    loading: lang === "am" ? "ፕሮፋይል በመጫን ላይ..." : "Profaayilii fe'aa jira...",
    failed: lang === "am" ? "የፕሮፋይል ውሂብ መጫን አልተቻለም።" : "Odeeffannoo profaayilii fe'uu hin dandeenye.",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2  className="animate-spin" size={24} />
        <span className="font-semibold">{text.loading}</span>
      </div>
    );
  }

  if (isError || !data || !data.identity) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <p className="text-lg font-black text-red-500">{text.failed}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-5 md:px-6">
      <main className="mx-auto w-full max-w-3xl space-y-5">
        <ProfileHeader identity={data.identity} onEdit={() => router.push("/settings")} />
        <StatisticsGrid stats={data.stats} />
        <AchievementsWall />
      </main>
    </div>
  );
}

