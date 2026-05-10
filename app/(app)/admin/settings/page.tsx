"use client";

import { useEffect, useState } from "react";
import { Save, Settings2 } from "lucide-react";
import { fetchSystemConfig, updateSystemConfig, type SystemConfig } from "@/api/admin.api";

interface ToastState {
  type: "success" | "error";
  message: string;
}

const emptyConfig: SystemConfig = {
  _id: "",
  isAIGenerationEnabled: false,
  activeSeasonId: null,
  maintenanceMode: false,
  dailyXpCap: 0,
};

const buildPayload = (config: SystemConfig) => ({
  isAIGenerationEnabled: config.isAIGenerationEnabled,
  maintenanceMode: config.maintenanceMode,
  activeSeasonId: config.activeSeasonId || null,
  dailyXpCap: config.dailyXpCap,
});

const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
      enabled ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
        enabled ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>(emptyConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchSystemConfig();
        if (active) {
          setConfig(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load system configuration.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadConfig();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleToggle = (key: "isAIGenerationEnabled" | "maintenanceMode") => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSeasonChange = (value: string) => {
    setConfig((prev) => ({ ...prev, activeSeasonId: value.trim() ? value : null }));
  };

  const handleXpChange = (value: string) => {
    const parsed = Number(value);
    setConfig((prev) => ({ ...prev, dailyXpCap: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateSystemConfig(buildPayload(config));
      setConfig(updated);
      setToast({ type: "success", message: "Configuration saved successfully." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save configuration.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Admin Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">System Settings</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Control global platform behavior and maintenance toggles.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Settings2 size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Configuration</h2>
            <p className="text-sm font-medium text-slate-500">Adjust feature flags and system limits.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm font-semibold text-slate-400">
            Loading system configuration...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">AI Content Generation</p>
                <p className="text-xs font-medium text-slate-500">
                  Allow experts to trigger Gemini AI for lessons and audio.
                </p>
              </div>
              <Toggle enabled={config.isAIGenerationEnabled} onChange={() => handleToggle("isAIGenerationEnabled")} />
            </div>

            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Maintenance Mode</p>
                <p className="text-xs font-medium text-slate-500">Prevent learners from logging in or studying.</p>
              </div>
              <Toggle enabled={config.maintenanceMode} onChange={() => handleToggle("maintenanceMode")} />
            </div>

            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Active Leaderboard Season</p>
                <p className="text-xs font-medium text-slate-500">Set the season ID used in leaderboards.</p>
              </div>
              <input
                value={config.activeSeasonId ?? ""}
                onChange={(event) => handleSeasonChange(event.target.value)}
                placeholder="season-2026"
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Daily XP Cap</p>
                <p className="text-xs font-medium text-slate-500">Limit daily XP accumulation per learner.</p>
              </div>
              <input
                type="number"
                min={0}
                value={Number.isFinite(config.dailyXpCap) ? config.dailyXpCap : 0}
                onChange={(event) => handleXpChange(event.target.value)}
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Save changes</p>
                <p className="text-xs font-medium text-slate-500">Apply the latest configuration across the platform.</p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black uppercase tracking-widest text-white transition ${
                  isSaving ? "bg-slate-300" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </section>

      {toast ? (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-xl">
          <div className="flex items-center gap-2">
            <span className={toast.type === "success" ? "text-emerald-600" : "text-rose-600"}>
              {toast.message}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
