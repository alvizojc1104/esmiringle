"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { Language, translations } from "../utils/i18n";
import { sound } from "../utils/audio";

export default function NotFound() {
  const [lang, setLang] = useState<Language>("bisaya");

  useEffect(() => {
    const savedLang = sessionStorage.getItem(
      "esmeringle_lang",
    ) as Language | null;
    if (savedLang === "en" || savedLang === "bisaya") {
      setLang(savedLang);
    }
  }, []);

  const toggleLang = () => {
    sound.playClickSound();
    const nextLang: Language = lang === "bisaya" ? "en" : "bisaya";
    setLang(nextLang);
    sessionStorage.setItem("esmeringle_lang", nextLang);
  };

  const t = translations[lang];

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleLang}
          aria-label="Toggle language"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs"
          title={lang === "bisaya" ? "Switch to English" : "Switch to Bisaya"}
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === "bisaya" ? "Bisaya" : "English"}</span>
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-md w-full">
        {/* App Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-3xl bg-blue-500/10 dark:bg-blue-400/10 blur-xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-192x192.png"
            alt="esmiringle icon"
            className="relative w-20 h-20 rounded-2xl object-contain shadow-lg border border-slate-200/80 dark:border-slate-800"
          />
        </div>

        {/* 404 Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 mb-3">
          404 &bull; Not Found
        </span>

        {/* Single-language custom text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t.notFoundTitle}
        </h1>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            {t.notFoundButton}
          </Link>
        </div>
      </div>
    </main>
  );
}
