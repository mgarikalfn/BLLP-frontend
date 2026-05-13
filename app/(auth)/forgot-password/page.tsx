"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ForgotPasswordInput, 
  ResetPasswordInput,
  forgotPasswordSchema,
  resetPasswordSchema
} from "@/lib/validations/auth";
import { useLanguageStore } from "@/store/languageStore";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const lang = useLanguageStore((s) => s.lang);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const t = {
    forgotTitle: lang === "am" ? "የይለፍ ቃል ረሱ?" : "Jecha darbii dagattan?",
    resetTitle: lang === "am" ? "የይለፍ ቃል ይቀይሩ" : "Jecha darbii jijjiiri",
    requestDesc: lang === "am" ? "ኢሜይልዎን ያስገቡና ባለ 6 አሃዝ ኮድ እንልክልዎታለን።" : "Iimeeyilii keessan galchaa, koodii lakkoofsa 6 isiniif ergina.",
    resetDesc: lang === "am" ? `ወደ ${email} የተላከውን ኮድ እና አዲሱን የይለፍ ቃል ያስገቡ።` : `Koodii gara ${email} ergame fi jecha darbii haaraa galchaa.`,
    emailPlaceholder: lang === "am" ? "ኢሜይል" : "Iimeeyilii",
    codePlaceholder: lang === "am" ? "ባለ 6 አሃዝ ኮድ" : "Koodii lakkoofsa 6",
    newPasswordPlaceholder: lang === "am" ? "አዲስ የይለፍ ቃል" : "Jecha darbii haaraa",
    confirmPasswordPlaceholder: lang === "am" ? "አዲስ የይለፍ ቃል ያረጋግጡ" : "Jecha darbii mirkaneessi",
    sendCode: lang === "am" ? "ኮድ ላክ" : "Koodii ergi",
    sending: lang === "am" ? "በመላክ ላይ..." : "Ergaa jira...",
    resetPassword: lang === "am" ? "የይለፍ ቃል ቀይር" : "Jecha darbii jijjiiri",
    resetting: lang === "am" ? "በመቀየር ላይ..." : "Jijjiiraa jira...",
    startOver: lang === "am" ? "እንደገና ጀምር" : "Irra deebi'ii jalqabi",
    remembered: lang === "am" ? "የይለፍ ቃልዎን አስታውሰዋል?" : "Jecha darbii keessan yaadattanii?",
    signIn: lang === "am" ? "ግባ" : "Seeni",
    successCode: lang === "am" ? "ኮድ ወደ ኢሜይልዎ ተልኳል።" : "Koodiin gara iimeeyilii keessanii ergameera.",
    successReset: lang === "am" ? "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል! አሁን መግባት ይችላሉ።" : "Jecha darbiin milkaa'inaan jijjiirameera! Amma seenuu dandeessu.",
    errorCode: lang === "am" ? "ችግር ተፈጥሯል" : "Rakkoon uumameera",
    errorInvalid: lang === "am" ? "ኮዱ የተሳሳተ ነው ወይም ጊዜው አልፏል።" : "Koodiin dogoggora yookaan yeroon isaa darbeera.",
  };

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleRequestCode = async (values: ForgotPasswordInput) => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email: values.email });
      setEmail(values.email);
      setStatus("success");
      setMessage(res.data.message || t.successCode);
      setStep("reset");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || t.errorCode);
    }
  };

  const handleResetPassword = async (values: ResetPasswordInput) => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", { 
        email, 
        code: values.code, 
        newPassword: values.password 
      });
      setStatus("success");
      setMessage(res.data.message || t.successReset);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || t.errorInvalid);
    }
  };

  const getMessageStyle = () => {
    if (status === "success") return "bg-green-50 text-green-700";
    if (status === "error") return "bg-red-50 text-red-600";
    return "hidden";
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-700">
          {step === "request" ? t.forgotTitle : t.resetTitle}
        </h2>
        <p className="text-sm text-slate-500">
          {step === "request" ? t.requestDesc : t.resetDesc}
        </p>
      </div>

      <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${getMessageStyle()}`}>
        {message}
      </div>

      {step === "request" ? (
        <form onSubmit={forgotForm.handleSubmit(handleRequestCode)} className="space-y-4">
          <div>
            <Input
              {...forgotForm.register("email")}
              type="email"
              placeholder={t.emailPlaceholder}
              className={`h-14 rounded-2xl border-2 ${forgotForm.formState.errors.email ? 'border-red-500' : 'border-slate-200'}`}
            />
            {forgotForm.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{forgotForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
          >
            {status === "loading" ? t.sending : t.sendCode}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
          <div>
            <Input
              {...resetForm.register("code")}
              placeholder={t.codePlaceholder}
              className={`h-14 rounded-2xl border-2 text-center text-lg tracking-widest font-bold ${resetForm.formState.errors.code ? 'border-red-500' : 'border-slate-200'}`}
              maxLength={6}
            />
            {resetForm.formState.errors.code && (
              <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{resetForm.formState.errors.code.message}</p>
            )}
          </div>
          
          <div>
            <div className="relative">
              <Input
                {...resetForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t.newPasswordPlaceholder}
                className={`h-14 rounded-2xl border-2 pr-12 ${resetForm.formState.errors.password ? 'border-red-500' : 'border-slate-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {resetForm.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{resetForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                {...resetForm.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPasswordPlaceholder}
                className={`h-14 rounded-2xl border-2 pr-12 ${resetForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{resetForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
          >
            {status === "loading" ? t.resetting : t.resetPassword}
          </Button>
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setStep("request")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              {t.startOver}
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-sm text-slate-500">
        {t.remembered}{" "}
        <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">
          {t.signIn}
        </Link>
      </div>
    </div>
  );
}
