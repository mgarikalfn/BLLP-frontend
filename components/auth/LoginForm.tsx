"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginInput } from "@/lib/validations/auth";

export const LoginForm = () => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  

  // Initialize Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
     resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError("");
    try {
      const endpoint = "/auth/login";
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
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
      >
        {isSubmitting ? "በመጫን ላይ..." : "ግባ (Login)"}
      </Button>
    </form>
  );
};
