"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const getMessageStyle = (status: "idle" | "loading" | "success" | "error") => {
  if (status === "success") return "bg-green-50 text-green-700";
  if (status === "error") return "bg-red-50 text-red-600";
  return "bg-slate-50 text-slate-600";
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Check your inbox for the verification code.");

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = token.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Enter the verification code from your email.");
      return;
    }

    setStatus("loading");
    setMessage("Verifying your email...");

    try {
      await api.post("/auth/verify-email", { email, token: trimmed });
      setStatus("success");
      setMessage("Email verified. You can now sign in.");
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please check the code and try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-700">Verify your email</h2>
        <p className="text-sm text-slate-500">
          {email ? `Check ${email} for your verification code.` : "Check your inbox for the verification code."}
        </p>
      </div>

      <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${getMessageStyle(status)}`}>
        {message}
      </div>

      <form onSubmit={handleVerify} className="space-y-3">
        <Input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Enter verification code"
          className="h-14 rounded-2xl border-2 border-slate-200"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
        >
          {status === "loading" ? "Verifying..." : "Verify email"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">
          Sign in
        </Link>
      </div>
    </div>
  );
}
