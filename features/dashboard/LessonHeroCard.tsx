import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/languageStore";
import { DashboardData } from "@/types/DashboardData";

type HeroLesson = NonNullable<DashboardData["actions"]["recommendedLesson"]>;

const heroText = {
  am: {
    unit: "ክፍል",
    continue: "ቀጥል",
    fallbackLesson: "ትምህርት ቀጥል",
    fallbackTopic: "የአሁኑ ርዕስ",
  },
  ao: {
    unit: "KUTAA",
    continue: "Itti fufi",
    fallbackLesson: "Barnoota itti fufi",
    fallbackTopic: "Mata Duree Amma",
  },
} as const;

const toLocalizedText = (
  value: { am: string; ao: string } | undefined,
  lang: "am" | "ao"
) => {
  if (!value) return "";
  return value[lang] || value.am || value.ao;
};

export function LessonHeroCard({ actions }: { actions: DashboardData["actions"] }) {
  const lang = useLanguageStore((state) => state.lang);
  const text = heroText[lang];
  const helperLang: "am" | "ao" = lang === "am" ? "ao" : "am";

  const lesson: HeroLesson | undefined = actions.continueLesson || actions.recommendedLesson;

  const lessonTitlePrimary = toLocalizedText(lesson?.title, lang) || text.fallbackLesson;
  const lessonTitleHelper = toLocalizedText(lesson?.title, helperLang);

  const topic = actions.recommendedLesson?.topic;
  const topicTitlePrimary = toLocalizedText(topic?.title, lang) || text.fallbackTopic;
  const levelLabel = topic?.level || "BEGINNER";
  const unitOrder = actions.recommendedLesson?.order || 1;

  const lessonHref = lesson?.id ? `/lessons/${lesson.id}` : "#";
  const isDisabled = !lesson?.id;

  return (
    <section className="rounded-3xl border-b-8 border-green-700 bg-green-500 p-6 text-white md:p-8">
      <div className="space-y-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-85">
          {text.unit} {unitOrder}: {levelLabel} • {topicTitlePrimary}
        </p>

        <div className="space-y-2">
          <h1 className="text-3xl font-black leading-tight md:text-4xl">{lessonTitlePrimary}</h1>
          {lessonTitleHelper && lessonTitleHelper !== lessonTitlePrimary ? (
            <p className="text-base font-bold opacity-80 md:text-lg">{lessonTitleHelper}</p>
          ) : null}
        </div>

        <div className="pt-1">
          <Link href={lessonHref} aria-disabled={isDisabled} className={isDisabled ? "pointer-events-none" : ""}>
            <Button
              className="w-full rounded-2xl border-2 border-b-4 border-white/70 bg-white px-8 py-6 text-lg font-black text-green-700 hover:bg-green-50 sm:w-auto"
              disabled={isDisabled}
            >
              {text.continue}
              <ChevronRight className="ml-2" size={22} strokeWidth={3} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
