/* "use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;

      login(user, token);

      router.push("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">

      <div className="w-96 bg-white p-6 rounded-lg shadow">

        <h1 className="text-xl font-bold mb-4">
          Login
        </h1>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          Login
        </button>

      </div>

    </div>
  );
} */
"use client";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { useLanguageStore } from "@/store/languageStore";

export default function LoginPage() {
  const lang = useLanguageStore((s) => s.lang);

  const t = {
    welcome: lang === "am" ? "እንኳን ደህና መጡ!" : "Baga nagaan dhuftan!",
    or: lang === "am" ? "ወይም በዚህ ይቀጥሉ" : "Yookaan kanaan itti fufi",
    noAccount: lang === "am" ? "Account የለዎት?" : "Akkaawuntii hin qabduu?",
    signup: lang === "am" ? "ተመዝገብ" : "Galmaa'i",
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-700 text-center">{t.welcome}</h2>
        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-500 font-bold">{t.or}</span>
          </div>
        </div>

        <GoogleAuthButton />

        {/* Signup Link */}
        <div className="text-center pt-1">
          <p className="text-sm text-slate-600">
            {t.noAccount} {" "}
            <a href="/signup" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              {t.signup}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}