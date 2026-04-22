import { DailyQuestsList } from "@/features/quests/DailyQuestsList";
import { DashboardData } from "@/types/DashboardData";

export function DailyQuestCard({ activity: _activity }: { activity: DashboardData["activity"] }) {
  void _activity;
  return <DailyQuestsList />;
}
