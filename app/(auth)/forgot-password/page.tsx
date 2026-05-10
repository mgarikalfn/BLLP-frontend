"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setStatus("success");
      setMessage(res.data.message || "Code sent to your email.");
      setStep("reset");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || newPassword.length < 6) {
      setStatus("error");
      setMessage("Please enter a valid code and a password at least 6 characters long.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post("/auth/reset-password", { email, code, newPassword });
      setStatus("success");
      setMessage(res.data.message || "Password reset successful! You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Invalid code or expired.");
    }
  };

  const getMessageStyle = () => {
    if (status === "success") return "bg-green-50 text-green-700";
    if (status === "error") return "bg-red-50 text-red-600";
    return "hidden";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-700">
          {step === "request" ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="text-sm text-slate-500">
          {step === "request" 
            ? "Enter your email and we'll send you a 6-digit reset code." 
            : `Enter the code sent to ${email} and your new password.`}
        </p>
      </div>

      <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${getMessageStyle()}`}>
        {message}
      </div>

      {step === "request" ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 rounded-2xl border-2 border-slate-200"
            required
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
          >
            {status === "loading" ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-14 rounded-2xl border-2 border-slate-200 text-center text-lg tracking-widest font-bold"
            maxLength={6}
            required
          />
          <Input
            type="password"
            placeholder="New Password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-14 rounded-2xl border-2 border-slate-200"
            required
            minLength={6}
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setStep("request")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Start over
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">
          Sign in
        </Link>
      </div>
    </div>
  );
}
