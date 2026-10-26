"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, Gender, GENDER_ALIASES } from "../types/chat";
import { Language, translations } from "../utils/i18n";
import { useChatSocket } from "../hooks/useChatSocket";
import OnboardingModal from "../components/OnboardingModal";
import { Sun, Moon, MessageSquare, Globe, ShieldAlert } from "lucide-react";
import { sound } from "../utils/audio";
import { APP_VERSION } from "../utils/version";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>("bisaya");

  // Lightweight socket connection on home page just for live online counter
  const { onlineCount } = useChatSocket(null);

  // Initialize theme, language, and load profile from sessionStorage
  useEffect(() => {
    setIsClient(true);

    // Language setup - default to bisaya
    const savedLang = sessionStorage.getItem(
      "esmeringle_lang",
    ) as Language | null;
    if (savedLang === "bisaya" || savedLang === "en") {
      setLang(savedLang);
    } else {
      setLang("bisaya");
    }

    // Theme setup - light is default
    const savedTheme = sessionStorage.getItem("esmeringle_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    // Profile setup from sessionStorage
    try {
      const stored =
        sessionStorage.getItem("esmeringle_profile") ||
        sessionStorage.getItem("esmiringhoy_profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      sessionStorage.setItem("esmeringle_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      sessionStorage.setItem("esmeringle_theme", "light");
    }
  };

  const toggleLang = () => {
    sound.playClickSound();
    const nextLang: Language = lang === "bisaya" ? "en" : "bisaya";
    setLang(nextLang);
    sessionStorage.setItem("esmeringle_lang", nextLang);
  };

  const t = translations[lang];

  const handleSelectGender = (gender: Gender) => {
    sound.playClickSound();
    const newProfile: UserProfile = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gender,
    };
    sessionStorage.setItem("esmeringle_profile", JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsOnboardingOpen(false);
  };

  const handleStartChat = () => {
    sound.playClickSound();
    if (!profile) {
      setIsOnboardingOpen(true);
      return;
    }
    // Navigate to dedicated /chat route
    router.push("/chat");
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/android-chrome-192x192.png"
                alt="esmiringle logo"
                className="w-6 h-6 rounded-md object-contain shadow-xs"
              />
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 lowercase">
                {t.appName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  Math.max(0, onlineCount - 1) > 0
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {Math.max(0, onlineCount - 1)} {t.online}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              title={
                lang === "bisaya" ? "Switch to English" : "Switch to Bisaya"
              }
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === "bisaya" ? "Bisaya" : "English"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full py-12 text-center animate-in fade-in duration-150">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t.talkToStrangers}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {t.subTitle}
          </p>

          {/* Direct Gender Selection if not yet set */}
          {!profile ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t.chooseAlias}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleSelectGender("male")}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center shadow-xs"
                >
                  <span className="text-3xl mb-1">👨</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate w-full text-center">
                    {GENDER_ALIASES.male}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate w-full text-center">
                    {t.maleLabel}
                  </span>
                </button>

                <button
                  onClick={() => handleSelectGender("female")}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center shadow-xs"
                >
                  <span className="text-3xl mb-1">👩</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate w-full text-center">
                    {GENDER_ALIASES.female}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate w-full text-center">
                    {t.femaleLabel}
                  </span>
                </button>

                <button
                  onClick={() => handleSelectGender("undisclosed")}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800 transition flex flex-col items-center justify-center shadow-xs"
                >
                  <span className="text-3xl mb-1">👤</span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate w-full text-center">
                    {GENDER_ALIASES.undisclosed}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate w-full text-center">
                    {t.preferNotToSayLabel}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span>{t.chattingAs}</span>
                <span className="font-bold flex items-center gap-1">
                  {profile.gender === "male"
                    ? `👨 ${GENDER_ALIASES.male}`
                    : profile.gender === "female"
                      ? `👩 ${GENDER_ALIASES.female}`
                      : `👤 ${GENDER_ALIASES.undisclosed}`}
                </span>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
                >
                  {t.change}
                </button>
              </div>

              <div>
                <button
                  onClick={handleStartChat}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.startChat}</span>
                </button>
                <p className="hidden sm:block text-xs text-slate-400 mt-2">
                  {t.escTip}
                </p>
              </div>
            </div>
          )}

          {/* Community Guidelines & Notes Card */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t.communityNotesTitle}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-500 shrink-0">18+</span>
                <span>{t.noteAge}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">🚫</span>
                <span>{t.noteNoNudity}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">🔒</span>
                <span>{t.notePrivacy}</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Change Alias Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onSave={(p) => {
          setProfile(p);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
        lang={lang}
      />

      {/* Watermarked Footer with App Versioning */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-3.5 text-center text-xs text-slate-400 dark:text-slate-500">
        <span>&copy; esmiringle 2026 | quickchow | {APP_VERSION}</span>
      </footer>
    </div>
  );
}
