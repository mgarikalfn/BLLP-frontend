import Link from "next/link";
import { Dumbbell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { DashboardData } from "@/types/DashboardData";

const practiceText = {
  am: {
    dueTitle: "የልምምድ ጊዜ ነው!",
    dueSubtitle: "{count} ቃላት ከማስታወስዎ እየጠፉ ነው።",
    start: "ግምገማ ጀምር",
    solidTitle: "ማስታወሻ ጠንካራ ነው",
    solidSubtitle: "አሁን የሚጠብቁ ግምገማዎች የሉም።",
  },
  ao: {
    dueTitle: "Yeroon Shaakalaa!",
    dueSubtitle: "Jechoonni {count} sammuu kee irraa badaa jiru.",
    start: "Irra Deebii Eegali",
    solidTitle: "Yaadannoo Jabaa",
    solidSubtitle: "Amma irra deebi'iin si eegu hin jiru.",
  },
} as const;

export function PracticeCard({ actions }: { actions: DashboardData["actions"] }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = practiceText[lang];

  const dueCount = actions.dueCount ?? 0;
  const hasDue = dueCount > 0;

  if (!hasDue) {
    return (
      <section className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border-b-4 border-gray-300 bg-white p-3 text-gray-500">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-700">{text.solidTitle}</h2>
            <p className="text-sm font-semibold text-gray-500">{text.solidSubtitle}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("rounded-2xl border-b-8 p-5 md:p-6", "border-blue-300 bg-blue-100")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border-b-4 border-blue-500 bg-blue-500 p-3 text-white">
            <Dumbbell size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-blue-900">{text.dueTitle}</h2>
            <p className="text-sm font-semibold text-blue-700">
              {text.dueSubtitle.replace("{count}", String(dueCount))}
            </p>
          </div>
        </div>

        <Link href="/review" className="w-full sm:w-auto">
          <Button className="w-full rounded-xl border-b-4 border-blue-700 bg-blue-600 px-6 py-5 text-base font-black text-white hover:bg-blue-700 sm:w-auto">
            {text.start}
          </Button>
        </Link>
      </div>
    </section>
  );
}
