"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, SignupInput } from "@/lib/validations/auth";

export const SignupForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getErrorMessage = (error: unknown) => {
    const responseData = (error as any)?.response?.data;
    const message = responseData?.message ?? responseData?.error ?? responseData;

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
  } = useForm<SignupInput>({
     resolver: zodResolver(signupSchema) as any,
  });

  const onSubmit = async (values: SignupInput) => {
    setServerError("");
    try {
      const endpoint = "/auth/register";
      await api.post(endpoint, {
        username: values.username,
        email: values.email,
        password: values.password,
        targetLang: values.targetLang,
        proficiency: values.proficiency,
      });
      
      router.push("/login");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Server/API Errors */}
      {serverError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm animate-shake">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <div>
          <Input
            {...register("username")}
            placeholder="የተጠቃሚ ስም (Username)"
            className={`h-14 rounded-2xl border-2 ${errors.username ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.username.message}</p>}
        </div>

        <div>
          <Input
            {...register("email")}
            type="email"
            placeholder="ኢሜይል (Email)"
            className={`h-14 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.email.message}</p>}
        </div>

        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="የይለፍ ቃል (Password)"
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
          {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.password.message}</p>}
        </div>

        <div className="relative">
          <Input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="የይለፍ ቃል ያረጋግጡ (Confirm Password)"
            className={`h-14 rounded-2xl border-2 pr-12 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <select
            {...register("targetLang")}
            defaultValue=""
            className={`flex h-14 w-full min-w-0 rounded-2xl border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-0 pb-0 items-center justify-center ${errors.targetLang ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="" disabled>የቋንቋ ይምረጡ (Select Target Language)</option>
            <option value="AMHARIC">Amharic (Amharic)</option>
            <option value="OROMO">Oromo (Oromo)</option>
          </select>
          {errors.targetLang && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.targetLang.message}</p>}
        </div>

        <div>
          <select
            {...register("proficiency")}
            defaultValue=""
            className={`flex h-14 w-full min-w-0 rounded-2xl border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pt-0 pb-0 items-center justify-center ${errors.proficiency ? 'border-red-500' : 'border-slate-200'}`}
          >
            <option value="" disabled>የቋንቋ ደረጃ ይምረጡ (Select Proficiency Level)</option>
            <option value="BEGINNER">ጀማሪ (Beginner)</option>
            <option value="INTERMEDIATE">መካከለኛ (Intermediate)</option>
            <option value="ADVANCED">የላቀ (Advanced)</option>
          </select>
          {errors.proficiency && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.proficiency.message}</p>}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
      >
        {isSubmitting ? "በመጫን ላይ..." : "ተመዝገብ (Sign Up)"}
      </Button>
    </form>
  );
};
