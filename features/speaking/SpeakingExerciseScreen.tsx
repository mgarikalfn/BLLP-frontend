"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
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

const speakingUiText = {
  am: {
    targetSentence: "የሚነበብ ዓረፍተ ነገር",
    aiHeard: "AI የሰማው",
    speakingChallenge: "የንግግር ፈተና",
    recordedAudio: "የተቀዳ ድምፅ",
    releaseToStop: "ለማቆም አዝራሩን ይልቀቁ።",
    noRecordingYet: "እስካሁን የተቀዳ ድምፅ የለም።",
    checking: "በመፈተሽ ላይ...",
    check: "ፈትሽ",
    recordAgain: "እንደገና ቅጂ",
    microphoneLabels: {
      startRecordingAriaLabel: "መቅጃ ጀምር",
      stopRecordingAriaLabel: "መቅጃ አቁም",
      recordingHint: "በመቅዳት ላይ... ለማቆም ይልቀቁ",
      idleHint: "ለመናገር ተጭነው ይያዙ",
    },
    resultLabels: {
      successTitle: "ትክክለኛ አነባበብ",
      retryTitle: "ቀጥለው ይሞክሩ",
    },
    errors: {
      unsupportedAudioRecording: "ይህ አሳሽ የድምፅ መቅጃን አይደግፍም።",
      unsupportedMicRecording: "ይህ አሳሽ የማይክሮፎን መቅጃን አይደግፍም።",
      recordingFailed: "መቅጃው አልተሳካም። እባክዎ ደግመው ይሞክሩ።",
      microphoneAccessRequired: "ለመቅዳት የማይክሮፎን ፍቃድ ያስፈልጋል።",
      loginRequired: "የንግግር ሙከራ ለመላክ መግባት አለብዎት።",
      failedToEvaluate: "የንግግር ሙከራውን መገምገም አልተቻለም።",
      unableToSubmit: "አሁን የንግግር ሙከራውን መላክ አይቻልም።",
    },
  },
  ao: {
    targetSentence: "Himicha dubbifamuu qabu",
    aiHeard: "AI kan dhageesse",
    speakingChallenge: "Qormaata dubbii",
    recordedAudio: "Sagalee galmeeffame",
    releaseToStop: "Dhaabuuf button gadi dhiisi.",
    noRecordingYet: "Ammaaf sagaleen hin galmoofne.",
    checking: "Qoramaa jira...",
    check: "Qori",
    recordAgain: "Irra deebi'ii galchi",
    microphoneLabels: {
      startRecordingAriaLabel: "Galmeessuu jalqabi",
      stopRecordingAriaLabel: "Galmeessuu dhaabi",
      recordingHint: "Galmaa'aa jira... dhaabuuf gadi dhiisi",
      idleHint: "Dubbachuuf qabii qabi",
    },
    resultLabels: {
      successTitle: "Dubbisni kee gaarii dha",
      retryTitle: "Itti fufi shaakaluu",
    },
    errors: {
      unsupportedAudioRecording: "Browser kun sagalee galmeessuu hin deeggartu.",
      unsupportedMicRecording: "Browser kun maayikiroofonii galmeessuu hin deeggartu.",
      recordingFailed: "Galmeen hin milkoofne. Mee irra deebi'i yaali.",
      microphoneAccessRequired: "Sagalee galchuuf hayyama maayikiroofonii barbaachisa.",
      loginRequired: "Yaalii dubbii erguuf seenuu qabda.",
      failedToEvaluate: "Yaalii dubbii madaaluu hin dandeenye.",
      unableToSubmit: "Amma yaalii dubbii erguu hin dandeenyu.",
    },
  },
} as const;

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
  const learningDirection = useLanguageStore((state) => state.learningDirection);
  const storeNativeLanguage = useLanguageStore((state) => state.lang);
  const storeTargetLanguage = useLanguageStore((state) => state.targetLang);

  const nativeLanguage: TargetLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "am"
      : "ao"
    : storeNativeLanguage;
  const effectiveTargetLanguage: TargetLanguage = learningDirection
    ? learningDirection === "AM_TO_OR"
      ? "ao"
      : "am"
    : storeTargetLanguage || targetLang;
  const uiText = speakingUiText[nativeLanguage];

  const targetLanguageLabel =
    nativeLanguage === "am"
      ? effectiveTargetLanguage === "am"
        ? "አማርኛ"
        : "አፋን ኦሮሞ"
      : effectiveTargetLanguage === "am"
        ? "Afaan Amaaraa"
        : "Afaan Oromoo";

  const recordInstructionText =
    nativeLanguage === "am"
      ? `${targetLanguageLabel} ቋንቋ በትክክል እንዲነገር ድምፅዎን ይቅዱ።`
      : `Dubbisa ${targetLanguageLabel} sirnaan akka dubbattuuf sagalee kee galchi.`;

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
      setError(uiText.errors.unsupportedAudioRecording);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(uiText.errors.unsupportedMicRecording);
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
        setError(uiText.errors.recordingFailed);
        setIsRecording(false);
        releaseMediaStream();
        mediaRecorderRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError(uiText.errors.microphoneAccessRequired);
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
      setError(uiText.errors.loginRequired);
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
    formData.append("targetLang", effectiveTargetLanguage);
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
        throw new Error(payload.message || uiText.errors.failedToEvaluate);
      }

      setResult(payload.data);

      if (payload.data.isCorrect) {
        onComplete?.(payload.data);
      }
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : uiText.errors.unableToSubmit;
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
        <TargetSentence
          expectedText={expectedText}
          transcribedText={result?.transcribedText}
          labels={{
            targetSentence: uiText.targetSentence,
            aiHeard: uiText.aiHeard,
          }}
        />

        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{uiText.speakingChallenge}</p>
          <p className="mt-2 text-sm font-semibold text-slate-600">{recordInstructionText}</p>

          <div className="mt-5 flex justify-center">
            <MicrophoneControl
              isRecording={isRecording}
              disabled={isLoading}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              labels={uiText.microphoneLabels}
            />
          </div>

          {audioPreviewUrl ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Volume2 size={14} />
                {uiText.recordedAudio}
              </p>
              <audio controls src={audioPreviewUrl} className="w-full" />
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold text-slate-500">
              {isRecording ? uiText.releaseToStop : uiText.noRecordingYet}
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
                  {uiText.checking}
                </span>
              ) : (
                uiText.check
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              variant="default"
              onClick={handleRecordAgain}
              disabled={isLoading || isRecording || !audioBlob}
            >
              {uiText.recordAgain}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      {result ? <ResultBanner isCorrect={result.isCorrect} feedback={result.feedback} labels={uiText.resultLabels} /> : null}
    </div>
  );
};
