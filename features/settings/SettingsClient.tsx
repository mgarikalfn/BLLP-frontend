"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, User, BookOpen, SlidersHorizontal, Camera, UserCircle2, Eye, EyeOff } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { ProfileData, UpdateProfilePayload } from "@/types/ProfileData";
import { useLanguageStore } from "@/store/languageStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

type Tab = "account" | "learning" | "preferences";

const allTabs: { id: Tab; icon: React.ElementType }[] = [
  { id: "account", icon: User },
  { id: "learning", icon: BookOpen },
  { id: "preferences", icon: SlidersHorizontal },
];

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const { data, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const lang = useLanguageStore((s) => s.lang);
  const setLearningDirection = useLanguageStore((s) => s.setLearningDirection);
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.toUpperCase();
  const isLearner = role === "LEARNER" || !role;

  // Filter tabs based on role — hide 'learning' for non-learners
  const tabs = allTabs.filter((tab) => {
    if (tab.id === "learning" && !isLearner) return false;
    return true;
  });

  // ---------- Form State ----------
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<ProfileData["learningSettings"]["targetLanguage"]>("AMHARIC");
  const [learningDirection, setLearningDirectionLocal] = useState<ProfileData["learningSettings"]["learningDirection"]>("AM_TO_OR");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const hasPassword = data?.identity?.hasPassword ?? false;

  // Populate form when data arrives
  useEffect(() => {
    if (!data) return;
    setPreviewUrl(data.identity?.avatarUrl || null);
    setBio(data.identity?.bio || "");
    setTargetLanguage(data.learningSettings?.targetLanguage || "AMHARIC");
    setLearningDirectionLocal(data.learningSettings?.learningDirection || "AM_TO_OR");
  }, [data]);

  // ---------- Localized text ----------
  const text = useMemo(
    () => ({
      pageTitle: lang === "am" ? "ቅንብሮች" : "Qindaa'inaalee",
      tabs: {
        account: lang === "am" ? "አካውንት" : "Akkaawuntii",
        learning: lang === "am" ? "ትምህርት" : "Barnoota",
        preferences: lang === "am" ? "ምርጫዎች" : "Filannoolee",
      },
      avatar: lang === "am" ? "የፕሮፋይል ምስል" : "Suuraa Profaayilii",
      changePhoto: lang === "am" ? "ፎቶ ቀይር" : "Suuraa jijjiiri",
      bio: lang === "am" ? "አጭር መግለጫ" : "Seenaa gabaabaa",
      bioPlaceholder: lang === "am" ? "ስለ ቋንቋ ጉዞዎ አጭር መግለጫ ይፃፉ" : "Imala afaanii kee gabaabinaan ibsi",
      targetLanguage: lang === "am" ? "የታለመ ቋንቋ" : "Afaan Kaayyoo",
      learningDirection: lang === "am" ? "የመማር አቅጣጫ" : "Kallattii Barnootaa",
      changePassword: lang === "am" ? "የይለፍ ቃል ቀይር" : "Jecha Darbii Jijjiiri",
      currentPassword: lang === "am" ? "የአሁኑ የይለፍ ቃል" : "Jecha Darbii Ammaa",
      newPassword: lang === "am" ? "አዲስ የይለፍ ቃል" : "Jecha Darbii Haaraa",
      confirmPassword: lang === "am" ? "አዲስ የይለፍ ቃል ያረጋግጡ" : "Jecha Darbii Mirkaneessi",
      interfaceLang: lang === "am" ? "የመተግበሪያ ቋንቋ" : "Afaan Appii",
      save: lang === "am" ? "ለውጦችን አስቀምጥ" : "Jijjiirama olkaa'i",
      saving: lang === "am" ? "በማስቀመጥ ላይ..." : "Olkaa'aa jira...",
      saved: lang === "am" ? "ተቀምጧል!" : "Olkaa'ameera!",
      failed: lang === "am" ? "ማዘመን አልተቻለም" : "Haaromsuu hin dandeenye",
      loading: lang === "am" ? "በመጫን ላይ..." : "Fe'aa jira...",
      error: lang === "am" ? "ውሂብ መጫን አልተቻለም" : "Odeeffannoo fe'uu hin dandeenye",
    }),
    [lang]
  );

  // ---------- Handlers ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      // Profile update
      const payload: UpdateProfilePayload = {
        bio: bio.trim() || undefined,
      };
      // Only include learning settings for learners
      if (isLearner) {
        payload.targetLanguage = targetLanguage;
        payload.learningDirection = learningDirection;
      }
      if (avatarFile) payload.avatarFile = avatarFile;

      await updateProfile.mutateAsync(payload);

      // Sync language store (learner only)
      if (isLearner) {
        setLearningDirection(learningDirection);
      }

      // Password change (if any field is filled)
      if (currentPassword || newPassword || confirmPassword) {
        const validation = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
        if (!validation.success) {
          throw new Error(validation.error.errors[0].message);
        }
        await api.post("/auth/change-password", { currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setAvatarFile(null);
      setFeedback({ type: "success", message: text.saved });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message || text.failed)
          : err instanceof Error
            ? err.message
            : text.failed;
      setFeedback({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Loading / Error states ----------
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-semibold">{text.loading}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <p className="text-lg font-black text-red-500">{text.error}</p>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Page Header */}
        <h1 className="text-3xl font-black text-gray-900 mb-6">{text.pageTitle}</h1>

        {/* Tab Navigation */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {text.tabs[tab.id]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
          {/* ===== ACCOUNT TAB ===== */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="mb-3 block text-sm font-bold text-gray-700">{text.avatar}</label>
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-full border-4 border-green-100 bg-gray-100">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <UserCircle2 size={40} />
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-green-400 hover:bg-green-50">
                      <Camera size={16} />
                      {text.changePhoto}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">{text.bio}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={160}
                  placeholder={text.bioPlaceholder}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-green-400"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{bio.length}/160</p>
              </div>

              {/* Change Password */}
              {hasPassword && (
                <>
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-800">{text.changePassword}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">{text.currentPassword}</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 pr-12 text-sm outline-none transition focus:border-green-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">{text.newPassword}</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 pr-12 text-sm outline-none transition focus:border-green-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-gray-700">{text.confirmPassword}</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 pr-12 text-sm outline-none transition focus:border-green-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== LEARNING TAB ===== */}
          {activeTab === "learning" && (
            <div className="space-y-6">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">{text.targetLanguage}</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as ProfileData["learningSettings"]["targetLanguage"])}
                  className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-sm outline-none transition focus:border-green-400"
                >
                  <option value="AMHARIC">{lang === "am" ? "አማርኛ" : "Afaan Amaaraa"}</option>
                  <option value="OROMO">{lang === "am" ? "ኦሮምኛ" : "Afaan Oromoo"}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">{text.learningDirection}</label>
                <select
                  value={learningDirection}
                  onChange={(e) => setLearningDirectionLocal(e.target.value as ProfileData["learningSettings"]["learningDirection"])}
                  className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-sm outline-none transition focus:border-green-400"
                >
                  <option value="AM_TO_OR">{lang === "am" ? "አማርኛ → ኦሮምኛ" : "Amaaraa → Oromoo"}</option>
                  <option value="OR_TO_AM">{lang === "am" ? "ኦሮምኛ → አማርኛ" : "Oromoo → Amaaraa"}</option>
                </select>
              </div>
            </div>
          )}

          {/* ===== PREFERENCES TAB ===== */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-bold text-gray-700">{text.interfaceLang}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => useLanguageStore.getState().setLang("am")}
                    className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition ${
                      lang === "am"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🇪🇹 አማርኛ
                  </button>
                  <button
                    onClick={() => useLanguageStore.getState().setLang("ao")}
                    className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition ${
                      lang === "ao"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    🇪🇹 Afaan Oromoo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback message */}
          {feedback && (
            <div
              className={`mt-5 rounded-lg px-4 py-3 text-sm font-semibold ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="px-6">
              {isSaving ? text.saving : text.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
