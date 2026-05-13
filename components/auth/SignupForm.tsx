"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { useLanguageStore } from "@/store/languageStore";
import {
  checkPasswordRequirements,
  calculatePasswordStrength,
  getMissingRequirements,
  getMissingRequirementsAmharic,
  isPasswordValid,
  type PasswordRequirements,
  type PasswordStrength,
} from "@/lib/passwordStrength";

export const SignupForm = () => {
  const router = useRouter();
  const lang = useLanguageStore((s) => s.lang);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>("weak");

  const t = {
    username: lang === "am" ? "የተጠቃሚ ስም" : "Maqaa itti fayyadamaa",
    email: lang === "am" ? "ኢሜይል" : "Iimeeyilii",
    password: lang === "am" ? "የይለፍ ቃል" : "Jecha darbii",
    confirmPassword: lang === "am" ? "የይለፍ ቃል ያረጋግጡ" : "Jecha darbii mirkaneessi",
    selectTarget: lang === "am" ? "የታለመ ቋንቋ ይምረጡ" : "Afaan kaayyoo filadhu",
    selectProficiency: lang === "am" ? "የቋንቋ ደረጃ ይምረጡ" : "Sadarkaa dandeettii filadhu",
    selectDirection: lang === "am" ? "የመማር አቅጣጫ ይምረጡ" : "Kallattii barnootaa filadhu",
    signup: lang === "am" ? "ተመዝገብ" : "Galmaa'i",
    loading: lang === "am" ? "በመጫን ላይ..." : "Fe'aa jira...",
    haveAccount: lang === "am" ? "ቀድሞ አካውንት አለዎት?" : "Akkaawuntii qabduu?",
    login: lang === "am" ? "ግባ" : "Seeni",
    requirements: {
      min: lang === "am" ? "8+ ፊደላት" : "8+ qubee",
      upper: lang === "am" ? "ትልቅ ፊደል (A-Z)" : "Qubee guddaa (A-Z)",
      lower: lang === "am" ? "ትንሽ ፊደል (a-z)" : "Qubee xiqqaa (a-z)",
      number: lang === "am" ? "ቁጥር (0-9)" : "Lakkoofsa (0-9)",
      special: lang === "am" ? "ልዩ ምልክት (!@#$%^&*)" : "Mallattoo addaa (!@#$%^&*)",
    },
    proficiency: {
      beginner: lang === "am" ? "ጀማሪ" : "Jalqabaa",
      intermediate: lang === "am" ? "መካከለኛ" : "Giddu-galeessa",
      advanced: lang === "am" ? "የላቀ" : "Olaanaa",
    }
  };

  type ApiErrorShape = {
    response?: {
      data?: {
        message?: unknown;
        error?: unknown;
      } | unknown;
    };
  };

  const getErrorMessage = (error: unknown) => {
    const responseData = (error as ApiErrorShape)?.response?.data;
    const message =
      responseData && typeof responseData === "object"
        ? (responseData as { message?: unknown; error?: unknown }).message ??
          (responseData as { message?: unknown; error?: unknown }).error ??
          responseData
        : responseData;

    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    if (message && typeof message === "object") {
      const flatValues = Object.values(message).flat();
      return flatValues.map((value) => String(value)).join(", ");
    }

    return "Something went wrong";
  };

  // Initialize Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupInput>({
      resolver: zodResolver(signupSchema),
  });

  const watchPassword = watch("password");

  // Update password strength on change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    const requirements = checkPasswordRequirements(newPassword);
    setPasswordRequirements(requirements);
    
    const strength = calculatePasswordStrength(requirements);
    setPasswordStrength(strength);
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
    }
  };

  const getStrengthLabel = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak":
        return "ደካማ (Weak)";
      case "medium":
        return "መካከለኛ (Medium)";
      case "strong":
        return "ጠንካራ (Strong)";
    }
  };

  const missingRequirements = getMissingRequirements(passwordRequirements);
  const missingRequirementsAmharic = getMissingRequirementsAmharic(passwordRequirements);

  const onSubmit = async (values: SignupInput) => {
    setServerError("");
    try {
      const endpoint = "/auth/register";
      await api.post(endpoint, {
        username: values.username,
        email: values.email,
        password: values.password,
        targetLanguage: values.targetLanguage,
        proficiencyLevel: values.proficiencyLevel,
        learningDirection: values.learningDirection,
      });
      
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Server/API Errors */}
      {serverError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm animate-shake">
          {serverError}
        </div>
      )}

      {/* Row 1: Username & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Input
            {...register("username")}
            placeholder={t.username}
            className={`h-14 rounded-2xl border-2 ${errors.username ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.username.message}</p>}
        </div>

        <div>
          <Input
            {...register("email")}
            type="email"
            placeholder={t.email}
            className={`h-14 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.email.message}</p>}
        </div>
      </div>

      {/* Row 2: Password & Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="relative">
            <Input
              {...register("password")}
              onChange={(e) => {
                register("password").onChange(e);
                handlePasswordChange(e);
              }}
              type={showPassword ? "text" : "password"}
              placeholder={t.password}
              className={`h-14 rounded-2xl border-2 pr-12 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.password.message}</p>}
        </div>

        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t.confirmPassword}
            className={`h-14 rounded-2xl border-2 px-3 pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 z-10"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Password Strength Indicator - Outside Grid */}
      {watchPassword && (
        <div className="space-y-1">
          {/* Strength Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                style={{
                  width: passwordStrength === "weak" ? "33%" : passwordStrength === "medium" ? "66%" : "100%",
                }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 min-w-fit whitespace-nowrap">
              {getStrengthLabel(passwordStrength)}
            </span>
          </div>

          {/* Requirements Checklist - Only show if NOT strong */}
          {passwordStrength !== "strong" && (
            <div className="bg-slate-50 rounded-lg p-1.5 grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                {passwordRequirements.minLength ? (
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordRequirements.minLength ? "text-green-600" : "text-red-500"}`}>
                  {t.requirements.min}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {passwordRequirements.hasUppercase ? (
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordRequirements.hasUppercase ? "text-green-600" : "text-red-500"}`}>
                  {t.requirements.upper}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {passwordRequirements.hasLowercase ? (
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordRequirements.hasLowercase ? "text-green-600" : "text-red-500"}`}>
                  {t.requirements.lower}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {passwordRequirements.hasNumber ? (
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordRequirements.hasNumber ? "text-green-600" : "text-red-500"}`}>
                  {t.requirements.number}
                </span>
              </div>

              <div className="flex items-center gap-1 col-span-2">
                {passwordRequirements.hasSpecialChar ? (
                  <Check size={12} className="text-green-600 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
                <span className={`text-xs ${passwordRequirements.hasSpecialChar ? "text-green-600" : "text-red-500"}`}>
                  {t.requirements.special}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Target Language & Proficiency Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <select
            {...register("targetLanguage")}
            defaultValue=""
            className={`flex h-14 w-full min-w-0 rounded-2xl border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-0 pb-0 items-center justify-center ${errors.targetLanguage ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="" disabled>{t.selectTarget}</option>
            <option value="AMHARIC">{lang === "am" ? "አማርኛ" : "Amaaraa"}</option>
            <option value="OROMO">{lang === "am" ? "ኦሮምኛ" : "Oromoo"}</option>
          </select>
          {errors.targetLanguage && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.targetLanguage.message}</p>}
        </div>

        <div>
          <select
            {...register("proficiencyLevel")}
            defaultValue=""
            className={`flex h-14 w-full min-w-0 rounded-2xl border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-0 pb-0 items-center justify-center ${errors.proficiencyLevel ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="" disabled>{t.selectProficiency}</option>
            <option value="BEGINNER">{t.proficiency.beginner}</option>
            <option value="INTERMEDIATE">{t.proficiency.intermediate}</option>
            <option value="ADVANCED">{t.proficiency.advanced}</option>
          </select>
          {errors.proficiencyLevel && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.proficiencyLevel.message}</p>}
        </div>
      </div>

      {/* Row 4: Learning Direction (Full Width) */}
      <div>
        <select
          {...register("learningDirection")}
          defaultValue=""
          className={`flex h-14 w-full min-w-0 rounded-2xl border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-0 pb-0 items-center justify-center ${errors.learningDirection ? 'border-red-500' : 'border-slate-200'}`}
        >
          <option value="" disabled>{t.selectDirection}</option>
          <option value="AM_TO_OR">{lang === "am" ? "አማርኛ → ኦሮምኛ" : "Amaaraa → Oromoo"}</option>
          <option value="OR_TO_AM">{lang === "am" ? "ኦሮምኛ → አማርኛ" : "Oromoo → Amaaraa"}</option>
        </select>
        {errors.learningDirection && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.learningDirection.message}</p>}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
      >
        {isSubmitting ? t.loading : t.signup}
      </Button>

      {/* Login Link */}
      <div className="text-center pt-1">
        <p className="text-sm text-slate-600">
          {t.haveAccount} {" "}
          <a href="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">
            {t.login}
          </a>
        </p>
      </div>
    </form>
  );
};
