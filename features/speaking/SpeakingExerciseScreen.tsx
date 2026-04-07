"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { MicrophoneControl } from "./components/MicrophoneControl";
import { ResultBanner } from "./components/ResultBanner";
import { TargetSentence } from "./components/TargetSentence";

type TargetLanguage = "am" | "ao";

interface SpeakingExerciseScreenProps {
  expectedText: string; 
  targetLang: TargetLanguage;
  exerciseId: string;
  onComplete?: (result: SpeakingSubmitResult) => void;
}

interface SpeakingSubmitResult {
  isCorrect: boolean;
  transcribedText: string;
  feedback: string;
  attemptId: string;
}

interface SpeakingSubmitResponse {
  success: boolean;
  data: SpeakingSubmitResult;
  message?: string;
}

const getFileExtension = (mimeType: string) => {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
};

export const SpeakingExerciseScreen = ({
  expectedText,
  targetLang,
  exerciseId,
  onComplete,
}: SpeakingExerciseScreenProps) => {
  const authToken = useAuthStore((state) => state.token);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeakingSubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const audioPreviewUrl = useMemo(() => {
    if (!audioBlob) return null;
    return URL.createObjectURL(audioBlob);
  }, [audioBlob]);

  const releaseMediaStream = () => {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      releaseMediaStream();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  const startRecording = async () => {
    if (isRecording || isLoading) return;

    if (typeof MediaRecorder === "undefined") {
      setError("This browser does not support audio recording.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support microphone recording.");
      return;
    }

    setError(null);
    setResult(null);
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];

      const supportedMimeType = preferredMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || chunksRef.current[0]?.type || "audio/webm",
        });

        setAudioBlob(recordedBlob);
        setIsRecording(false);
        releaseMediaStream();
        mediaRecorderRef.current = null;
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try again.");
        setIsRecording(false);
        releaseMediaStream();
        mediaRecorderRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access is required to record your speech.");
      setIsRecording(false);
      releaseMediaStream();
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || isLoading || isRecording) return;

    const token = authToken || window.localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to submit speaking attempts.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    const extension = getFileExtension(audioBlob.type || "audio/webm");

    formData.append(
      "audio",
      new File([audioBlob], `speaking-${exerciseId}.${extension}`, {
        type: audioBlob.type || "audio/webm",
      })
    );
    formData.append("expectedText", expectedText);
    formData.append("targetLang", targetLang);
    formData.append("exerciseId", exerciseId);

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

    try {
      const response = await fetch(`${apiBase}/speaking/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = (await response.json()) as SpeakingSubmitResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || "Failed to evaluate speaking attempt.");
      }

      setResult(payload.data);

      if (payload.data.isCorrect) {
        onComplete?.(payload.data);
      }
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit speaking attempt right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAgain = () => {
    setAudioBlob(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-3xl border-2 border-slate-200 bg-slate-50/80 px-4 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:px-6 md:py-8">
      <div className="space-y-6">
        <TargetSentence expectedText={expectedText} transcribedText={result?.transcribedText} />

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Speaking Challenge</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Record your pronunciation in {targetLang === "am" ? "Amharic" : "Afan Oromo"}
          </p>

          <div className="mt-5 flex justify-center">
            <MicrophoneControl
              isRecording={isRecording}
              disabled={isLoading}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
          </div>

          {audioPreviewUrl ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Volume2 size={14} />
                Recorded Audio
              </p>
              <audio controls src={audioPreviewUrl} className="w-full" />
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold text-slate-500">
              {isRecording ? "Release the button to stop recording." : "No recording yet."}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              variant="primary"
              onClick={handleSubmit}
              disabled={!audioBlob || isLoading || isRecording}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Checking...
                </span>
              ) : (
                "Check"
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="default"
              onClick={handleRecordAgain}
              disabled={isLoading || isRecording || !audioBlob}
            >
              Record Again
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      {result ? <ResultBanner isCorrect={result.isCorrect} feedback={result.feedback} /> : null}
    </div>
  );
};
