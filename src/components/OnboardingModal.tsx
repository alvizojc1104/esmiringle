"use client";

import React from "react";
import { UserProfile, Gender, GENDER_ALIASES } from "../types/chat";
import { Language, translations } from "../utils/i18n";

interface OnboardingModalProps {
  isOpen: boolean;
  onSave: (profile: UserProfile) => void;
  onClose?: () => void;
  lang?: Language;
}

export default function OnboardingModal({ isOpen, onSave, onClose, lang = "bisaya" }: OnboardingModalProps) {
  if (!isOpen) return null;
  const t = translations[lang];

  const handleSelectGender = (gender: Gender) => {
    const profile: UserProfile = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gender,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("esmeringle_profile", JSON.stringify(profile));
    }

    onSave(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold">{t.modalTitle}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm rounded-lg"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {t.modalSubTitle}
        </p>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectGender("male")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
          >
            <span className="text-3xl mb-1.5">👨</span>
            <span className="font-bold text-sm truncate w-full text-center">{GENDER_ALIASES.male}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full text-center">{t.maleLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGender("female")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-pink-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-pink-400 dark:hover:border-pink-500 transition-all text-slate-800 dark:text-slate-200"
          >
            <span className="text-3xl mb-1.5">👩</span>
            <span className="font-bold text-sm truncate w-full text-center">{GENDER_ALIASES.female}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full text-center">{t.femaleLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGender("undisclosed")}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all text-slate-800 dark:text-slate-200"
          >
            <span className="text-3xl mb-1.5">👤</span>
            <span className="font-bold text-sm truncate w-full text-center">{GENDER_ALIASES.undisclosed}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full text-center">{t.preferNotToSayLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
