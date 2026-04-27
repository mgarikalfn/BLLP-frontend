import { CalendarDays, Edit2, UserCircle2 } from "lucide-react";
import { ProfileData } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";

interface ProfileHeaderProps {
  identity: ProfileData["identity"];
  onEdit: () => void;
}

const headerText = {
  am: {
    joined: "ተቀላቀለ",
    editProfile: "ፕሮፋይል አርትዕ",
  },
  ao: {
    joined: "Miseensa ta'e",
    editProfile: "Profaayilii gulaali",
  },
} as const;

const formatJoinedAt = (joinedAt: string, lang: "am" | "ao", joinedLabel: string) => {
  const date = new Date(joinedAt);
  const locale = lang === "am" ? "am-ET" : "om-ET";
  return `${joinedLabel} ${new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date)}`;
};

export function ProfileHeader({ identity, onEdit }: ProfileHeaderProps) {
  const lang = useLanguageStore((state) => state.lang);
  const text = headerText[lang];

  if (!identity) return null;

  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
          <div className="h-full w-full overflow-hidden rounded-full border-4 border-green-100 bg-gray-100">
            {identity.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={identity.avatarUrl} alt={identity.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <UserCircle2 size={56} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-b-4 border-green-700 bg-green-500 text-white transition hover:bg-green-600"
            aria-label={text.editProfile}
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="truncate text-3xl font-black text-gray-900">{identity.username}</h1>
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
            <CalendarDays size={14} />
            <span>{formatJoinedAt(identity.joinedAt, lang, text.joined)}</span>
          </div>
          {identity.bio ? <p className="pt-1 text-sm font-medium text-gray-600">{identity.bio}</p> : null}
        </div>
      </div>
    </section>
  );
}
