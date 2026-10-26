"use client";

import React, { useEffect } from "react";
import { AlertCircle, Scissors, Edit3, X } from "lucide-react";
import { Language, translations } from "../utils/i18n";

interface CharLimitModalProps {
  isOpen: boolean;
  charCount: number;
  maxChars?: number;
  onTrim: () => void;
  onClose: () => void;
  lang?: Language;
}

export default function CharLimitModal({
  isOpen,
  charCount,
  maxChars = 1000,
  onTrim,
  onClose,
  lang = "en",
}: CharLimitModalProps) {
  const t = translations[lang];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overage = Math.max(0, charCount - maxChars);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="char-limit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        {/* Close X icon */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3.5">
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3
          id="char-limit-title"
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 text-center"
        >
          {t.charLimitTitle}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5 leading-relaxed">
          {t.charLimitDesc(charCount, maxChars)}
        </p>

        {/* Character stats card */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Length</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {charCount.toLocaleString()} / {maxChars.toLocaleString()} ({t.charLimitBadge(overage)})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onTrim}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{t.charLimitTrimBtn}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.charLimitEditBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
