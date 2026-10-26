"use client";

import React, { useEffect } from "react";
import { UserProfile, GENDER_ALIASES } from "../types/chat";
import { Language, translations } from "../utils/i18n";
import { Loader2, X } from "lucide-react";

interface MatchmakingRadarProps {
  profile: UserProfile;
  onlineCount: number;
  onCancel: () => void;
  lang?: Language;
}

export default function MatchmakingRadar({ profile, onlineCount, onCancel, lang = "en" }: MatchmakingRadarProps) {
  const t = translations[lang];

  // ESC to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const myAlias = GENDER_ALIASES[profile.gender] || profile.gender;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center select-none animate-in fade-in duration-150">
      <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {t.lookingForStranger}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
        {t.connectingOnline}
      </p>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>{onlineCount || 1} {t.online}</span>
        <span>•</span>
        <span>{t.chattingAs} <strong>{myAlias}</strong></span>
      </div>

      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
      >
        <X className="w-3.5 h-3.5" />
        <span className="sm:hidden">{lang === "bisaya" ? "Kanselahon" : "Cancel"}</span>
        <span className="hidden sm:inline">{t.cancel}</span>
      </button>
    </div>
  );
}
