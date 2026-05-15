"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
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

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const buildCertificateSvg = ({
  displayName,
  displayLevel,
  displayScore,
  formattedDate,
}: {
  displayName: string;
  displayLevel: string;
  displayScore: string;
  formattedDate: string;
}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="980" viewBox="0 0 1400 980">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffaf1" />
      <stop offset="100%" stop-color="#fff1d6" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.24" />
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1400" height="980" rx="42" fill="url(#bg)" />
  <rect x="22" y="22" width="1356" height="936" rx="34" fill="none" stroke="#fde68a" stroke-width="4" />
  <rect x="56" y="56" width="1288" height="868" rx="28" fill="none" stroke="#fde68a" stroke-width="2" />
  <rect width="1400" height="980" rx="42" fill="url(#glow)" />

  <text x="700" y="150" text-anchor="middle" fill="#d97706" font-size="22" font-weight="900" letter-spacing="8">CERTIFICATE OF COMPLETION</text>
  <text x="700" y="275" text-anchor="middle" fill="#0f172a" font-size="60" font-weight="700" font-family="Georgia, 'Times New Roman', serif">${escapeXml(displayName)}</text>
  <text x="700" y="340" text-anchor="middle" fill="#475569" font-size="26" font-weight="600">has successfully completed the certification assessment.</text>

  <rect x="180" y="430" width="430" height="170" rx="26" fill="rgba(255,255,255,0.72)" stroke="#fde68a" stroke-width="2" />
  <rect x="790" y="430" width="430" height="170" rx="26" fill="rgba(255,255,255,0.72)" stroke="#fde68a" stroke-width="2" />

  <text x="395" y="485" text-anchor="middle" fill="#d97706" font-size="20" font-weight="900" letter-spacing="3">LEVEL</text>
  <text x="395" y="545" text-anchor="middle" fill="#0f172a" font-size="36" font-weight="700">${escapeXml(displayLevel)}</text>

  <text x="1005" y="485" text-anchor="middle" fill="#d97706" font-size="20" font-weight="900" letter-spacing="3">FINAL SCORE</text>
  <text x="1005" y="545" text-anchor="middle" fill="#0f172a" font-size="36" font-weight="700">${escapeXml(displayScore)}</text>

  <text x="700" y="700" text-anchor="middle" fill="#475569" font-size="28" font-weight="600">${escapeXml(formattedDate)}</text>

  <line x1="250" y1="790" x2="1150" y2="790" stroke="#fde68a" stroke-width="2" />
  <text x="700" y="845" text-anchor="middle" fill="#b45309" font-size="18" font-weight="900" letter-spacing="4">BLLP LANGUAGE INSTITUTE</text>
  <text x="700" y="885" text-anchor="middle" fill="#64748b" font-size="18">Authorized digital certificate</text>
</svg>`;

const fetchCertificateAttempt = async (attemptId: string) => {
  const endpoints = [
    `/study/certifications/${attemptId}`,
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
      const svg = buildCertificateSvg({
        displayName,
        displayLevel,
        displayScore,
        formattedDate,
      });
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Failed to render certificate image."));
        nextImage.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = 1400;
      canvas.height = 980;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        throw new Error("Unable to create certificate canvas.");
      }

      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(objectUrl);

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
          className="relative overflow-hidden rounded-[32px] border-4 p-10"
          style={{ 
            borderColor: "#fde68a", 
            backgroundColor: "#fffaf1",
            boxShadow: "0 30px 90px rgba(120,72,18,0.18)"
          }}
        >
          <div 
            className="absolute inset-0" 
            style={{ background: "radial-gradient(circle at top, rgba(250,204,21,0.16), rgba(0,0,0,0) 60%)" }}
          />
          <div className="absolute inset-6 rounded-[28px] border" style={{ borderColor: "#fde68a" }} />

          <div className="relative z-10 flex flex-col items-center text-center font-serif">
            <p className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: "#d97706" }}>Certificate of Completion</p>
            <h2 className="mt-6 text-3xl font-bold sm:text-4xl" style={{ color: "#0f172a" }}>{displayName}</h2>
            <p className="mt-3 text-sm font-semibold" style={{ color: "#475569" }}>has successfully completed the certification assessment.</p>

            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "#fde68a", backgroundColor: "rgba(255,255,255,0.7)" }}>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#d97706" }}>Level</p>
                <p className="mt-2 text-lg font-bold" style={{ color: "#0f172a" }}>{displayLevel}</p>
              </div>
              <div className="rounded-2xl border px-5 py-4" style={{ borderColor: "#fde68a", backgroundColor: "rgba(255,255,255,0.7)" }}>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#d97706" }}>Final Score</p>
                <p className="mt-2 text-lg font-bold" style={{ color: "#0f172a" }}>{displayScore}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold" style={{ color: "#475569" }}>
              <CalendarDays className="h-4 w-4" style={{ color: "#d97706" }} />
              {formattedDate}
            </div>

            <div className="mt-10 w-full border-t pt-6" style={{ borderColor: "#fde68a" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#b45309" }}>Bllp Language Institute</p>
              <p className="mt-2 text-xs" style={{ color: "#64748b" }}>Authorized digital certificate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
