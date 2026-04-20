import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileData, UpdateProfilePayload } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialValues: {
    avatarUrl: string;
    bio: string;
    targetLanguage: ProfileData["learningSettings"]["targetLanguage"];
    learningDirection: ProfileData["learningSettings"]["learningDirection"];
  };
  onSave: (payload: UpdateProfilePayload) => Promise<unknown>;
}

export function EditProfileModal({ open, onClose, initialValues, onSave }: EditProfileModalProps) {
  const lang = useLanguageStore((state) => state.lang);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);
  const [bio, setBio] = useState(initialValues.bio);
  const [targetLanguage, setTargetLanguage] = useState(initialValues.targetLanguage);
  const [learningDirection, setLearningDirection] = useState(initialValues.learningDirection);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    title: lang === "am" ? "ፕሮፋይል አርትዕ" : "Profaayilii gulaali",
    avatarUrl: lang === "am" ? "የፕሮፋይል ምስል አድራሻ" : "URL Suuraa Profaayilii",
    avatarPlaceholder:
      lang === "am" ? "https://example.com/avatar.jpg ያስገቡ" : "https://example.com/avatar.jpg galchi",
    bio: lang === "am" ? "አጭር መግለጫ" : "Seenaa gabaabaa",
    bioPlaceholder:
      lang === "am" ? "ስለ ቋንቋ ጉዞዎ አጭር መግለጫ ይፃፉ" : "Imala afaanii kee gabaabinaan ibsi",
    targetLanguage: lang === "am" ? "የታለመ ቋንቋ" : "Afaan Kaayyoo",
    learningDirection: lang === "am" ? "የመማር አቅጣጫ" : "Kallattii Barnootaa",
    cancel: lang === "am" ? "ሰርዝ" : "Haqi",
    saving: lang === "am" ? "በማስቀመጥ ላይ..." : "Olkaa'aa jira...",
    saveChanges: lang === "am" ? "ለውጦችን አስቀምጥ" : "Jijjiirama olkaa'i",
    updateFailed: lang === "am" ? "ፕሮፋይል ማዘመን አልተቻለም" : "Profaayilii haaromsuu hin dandeenye",
  };

  useEffect(() => {
    if (!open) return;
    setAvatarUrl(initialValues.avatarUrl);
    setBio(initialValues.bio);
    setTargetLanguage(initialValues.targetLanguage);
    setLearningDirection(initialValues.learningDirection);
    setError(null);
  }, [open, initialValues]);

  if (!open) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
        targetLanguage,
        learningDirection,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || text.updateFailed)
          : err instanceof Error
            ? err.message
            : text.updateFailed;
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-xl md:p-6">
        <h2 className="text-2xl font-black text-gray-900">{text.title}</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-600">{text.avatarUrl}</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={text.avatarPlaceholder}
              className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-sm outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-600">{text.bio}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder={text.bioPlaceholder}
              className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">{text.targetLanguage}</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as ProfileData["learningSettings"]["targetLanguage"])}
                className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-sm outline-none focus:border-green-400"
              >
                <option value="AMHARIC">{lang === "am" ? "አማርኛ" : "Afaan Amaaraa"}</option>
                <option value="OROMO">{lang === "am" ? "ኦሮምኛ" : "Afaan Oromoo"}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-600">{text.learningDirection}</label>
              <select
                value={learningDirection}
                onChange={(e) => setLearningDirection(e.target.value as ProfileData["learningSettings"]["learningDirection"])}
                className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-sm outline-none focus:border-green-400"
              >
                <option value="AM_TO_OR">{lang === "am" ? "አማርኛ -> ኦሮምኛ" : "Amaaraa -> Oromoo"}</option>
                <option value="OR_TO_AM">{lang === "am" ? "ኦሮምኛ -> አማርኛ" : "Oromoo -> Amaaraa"}</option>
              </select>
            </div>
          </div>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            {text.cancel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? text.saving : text.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  );
}
