"use client";

import { SignupForm } from "@/components/auth/SignupForm";
import { useLanguageStore } from "@/store/languageStore";

export default function SignupPage() {
  const lang = useLanguageStore((s) => s.lang);
  const title = lang === "am" ? "መገለጫ ይፍጠሩ" : "Profaayilii uumi";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3 px-4 py-2">
        <h2 className="text-2xl font-bold text-slate-700 text-center">{title}</h2>
        <SignupForm/>
      </div>
    </div>
  );
}