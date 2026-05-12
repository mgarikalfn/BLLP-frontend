"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import type { LearningDirection } from "@/types/ProfileData";
import { getRedirectPath } from "@/lib/roleRedirect";

export default function GoogleAuthButton() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const initializeFromProfile = useLanguageStore((s) => s.initializeFromProfile);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setServerError("");

    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      setServerError("Missing Google token. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/google-login", { token: googleToken });
      const { accessToken, id, username, role, learningDirection } = res.data as {
        accessToken: string;
        id: string;
        username: string;
        role: string;
        learningDirection?: LearningDirection;
      };

      login({ id, username, role, learningDirection }, accessToken);

      if (learningDirection) {
        initializeFromProfile(learningDirection);
      }

      router.push(getRedirectPath(role));
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message || "Google login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = () => {
    setServerError("Google login failed. Please try again.");
  };

  return (
    <div className="space-y-3">
      {serverError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-sm animate-shake">
          {serverError}
        </div>
      )}

      <div className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
}
