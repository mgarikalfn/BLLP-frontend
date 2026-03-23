"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, signupSchema, LoginInput, SignupInput } from "@/lib/validations/auth";

export const AuthForm = ({ type }: { type: "login" | "signup" }) => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState("");
  const isLogin = type === "login";

  // Initialize Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
     resolver: zodResolver(isLogin ? loginSchema : signupSchema) as any,
  });

  const onSubmit = async (values: SignupInput) => {
    setServerError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, values);
      
      const { user, token } = res.data;
      login(user, token); // Update your Zustand store
      
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Something went wrong");
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
            {...register("email")}
            placeholder="ኢሜይል (Email)"
            className={`h-14 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.email.message}</p>}
        </div>

        <div>
          <Input
            {...register("password")}
            type="password"
            placeholder="የይለፍ ቃል (Password)"
            className={`h-14 rounded-2xl border-2 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.password.message}</p>}
        </div>

        {!isLogin && (
          <div>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="የይለፍ ቃል ያረጋግጡ (Confirm Password)"
              className={`h-14 rounded-2xl border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-2 font-bold">{errors.confirmPassword.message}</p>}
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
      >
        {isSubmitting ? "በመጫን ላይ..." : isLogin ? "ግባ (Login)" : "ተመዝገብ (Sign Up)"}
      </Button>
    </form>
  );
};