"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";

type CertificateUser = {
  name?: string;
  fullName?: string;
  username?: string;
};

type CertificateAttempt = {
  level?: string;
  score?: number;
  createdAt?: string;
  certificateId?: string;
  user?: CertificateUser;
};

const fetchCertificateAttempt = async (attemptId: string) => {
  const endpoints = [
    `/certifications/attempts/${attemptId}`,
    `/certifications/${attemptId}`,
    `/api/certifications/attempts/${attemptId}`,
    `/api/certifications/${attemptId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to load certificate data.");
};

export default function CertificatePage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const attemptId = Array.isArray(params.attemptId) ? params.attemptId[0] : params.attemptId;

  const [attempt, setAttempt] = useState<CertificateAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!attemptId) return;

      setIsLoading(true);
      setError(null);

      try {
        const payload = (await fetchCertificateAttempt(attemptId)) as {
          data?: CertificateAttempt;
        } & CertificateAttempt;

        const resolved = ("data" in payload ? payload.data : payload) || null;

        if (!resolved) {
          throw new Error("Certificate data not available.");
        }

        setAttempt(resolved);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load certificate.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCertificate();
  }, [attemptId]);

  const displayName = useMemo(() => {
    const user = attempt?.user;
    return user?.name || user?.fullName || user?.username || "Distinguished Learner";
  }, [attempt?.user]);

  const displayLevel = attempt?.level || "Certified";
  const displayScore = typeof attempt?.score === "number" ? `${attempt.score}%` : "—";

  const formattedDate = useMemo(() => {
    if (!attempt?.createdAt) return "—";
    try {
      return format(new Date(attempt.createdAt), "MMMM d, yyyy");
    } catch {
      return attempt.createdAt;
    }
  }, [attempt?.createdAt]);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#fdf8ef",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `certificate-${attemptId || "bllp"}.png`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8ef]">
        <div className="flex flex-col items-center gap-3 text-amber-700">
          <Loader2 className="h-9 w-9 animate-spin" />
          <p className="text-sm font-semibold">Preparing certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8ef] px-4 text-center">
        <div className="max-w-md space-y-4">
          <p className="text-sm font-semibold text-amber-700">{error || "Certificate not found."}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8ef] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Diploma</p>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Your Certification</h1>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Preparing..." : "Download as Image"}
          </button>
        </div>

        <div
          ref={certificateRef}
          className="relative overflow-hidden rounded-[32px] border-4 border-amber-200 bg-[#fffaf1] p-10 shadow-[0_30px_90px_rgba(120,72,18,0.18)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),transparent_60%)]" />
          <div className="absolute inset-6 rounded-[28px] border border-amber-200" />

          <div className="relative z-10 flex flex-col items-center text-center font-serif">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-amber-600">Certificate of Completion</p>
            <h2 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">{displayName}</h2>
            <p className="mt-3 text-sm font-semibold text-slate-600">has successfully completed the certification assessment.</p>

            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white/70 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Level</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{displayLevel}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white/70 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Final Score</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{displayScore}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <CalendarDays className="h-4 w-4 text-amber-600" />
              {formattedDate}
            </div>

            <div className="mt-10 w-full border-t border-amber-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Bllp Language Institute</p>
              <p className="mt-2 text-xs text-slate-500">Authorized digital certificate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
