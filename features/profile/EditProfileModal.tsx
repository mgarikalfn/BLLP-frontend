import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileData, UpdateProfilePayload } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";
import { api } from "@/lib/api";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialValues: {
    avatarUrl: string;
    bio: string;
    targetLanguage: ProfileData["learningSettings"]["targetLanguage"];
    learningDirection: ProfileData["learningSettings"]["learningDirection"];
    hasPassword: boolean;
  };
  onSave: (payload: UpdateProfilePayload) => Promise<unknown>;
}

export function EditProfileModal({ open, onClose, initialValues, onSave }: EditProfileModalProps) {
  const lang = useLanguageStore((state) => state.lang);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues.avatarUrl);
  const [bio, setBio] = useState(initialValues.bio);
  const [targetLanguage, setTargetLanguage] = useState(initialValues.targetLanguage);
  const [learningDirection, setLearningDirection] = useState(initialValues.learningDirection);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = {
    title: lang === "am" ? "ፕሮፋይል አርትዕ" : "Profaayilii gulaali",
    avatarLabel: lang === "am" ? "የፕሮፋይል ምስል" : "Suuraa Profaayilii",
    avatarPlaceholder:
      lang === "am" ? "ምስል ይምረጡ" : "Suuraa filadhu",
    bio: lang === "am" ? "አጭር መግለጫ" : "Seenaa gabaabaa",
    bioPlaceholder:
      lang === "am" ? "ስለ ቋንቋ ጉዞዎ አጭር መግለጫ ይፃፉ" : "Imala afaanii kee gabaabinaan ibsi",
    targetLanguage: lang === "am" ? "የታለመ ቋንቋ" : "Afaan Kaayyoo",
    learningDirection: lang === "am" ? "የመማር አቅጣጫ" : "Kallattii Barnootaa",
    cancel: lang === "am" ? "ሰርዝ" : "Haqi",
    saving: lang === "am" ? "በማስቀመጥ ላይ..." : "Olkaa'aa jira...",
    saveChanges: lang === "am" ? "ለውጦችን አስቀምጥ" : "Jijjiirama olkaa'i",
    updateFailed: lang === "am" ? "ፕሮፋይል ማዘመን አልተቻለም" : "Profaayilii haaromsuu hin dandeenye",
    changePasswordTitle: lang === "am" ? "የይለፍ ቃል ቀይር" : "Jecha Darbii Jijjiiri",
    currentPassword: lang === "am" ? "የአሁኑ የይለፍ ቃል" : "Jecha Darbii Ammaa",
    newPassword: lang === "am" ? "አዲስ የይለፍ ቃል (ቢያንስ 6 ፊደላት)" : "Jecha Darbii Haaraa (Gadi aanaan qubee 6)",
  };

  useEffect(() => {
    if (!open) return;
    setAvatarUrl(initialValues.avatarUrl);
    setAvatarFile(null);
    setPreviewUrl(initialValues.avatarUrl);
    setBio(initialValues.bio);
    setTargetLanguage(initialValues.targetLanguage);
    setLearningDirection(initialValues.learningDirection);
    setCurrentPassword("");
    setNewPassword("");
    setError(null);
  }, [open, initialValues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAvatarUrl(""); // clear text url if file is selected
    }
  };

  if (!open) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        avatarUrl: avatarFile ? undefined : (avatarUrl.trim() || undefined),
        avatarFile: avatarFile || undefined,
        bio: bio.trim() || undefined,
        targetLanguage,
        learningDirection,
      });

      // Change Password if provided
      if (currentPassword && newPassword) {
        await api.post("/auth/change-password", { currentPassword, newPassword });
      }

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
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-xl md:p-6">
        <h2 className="text-2xl font-black text-gray-900">{text.title}</h2>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar Preview" className="h-16 w-16 rounded-full object-cover shadow-sm border" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm border">
                No
              </div>
            )}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-bold text-gray-600">{text.avatarLabel}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
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

          {initialValues.hasPassword && (
            <>
              <div className="my-6 border-t border-gray-200"></div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-800">{text.changePasswordTitle}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-600">{text.currentPassword}</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-sm outline-none focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-600">{text.newPassword}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border-2 border-gray-200 px-3 text-sm outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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
