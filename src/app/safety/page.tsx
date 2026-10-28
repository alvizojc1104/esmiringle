"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SafetyPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<"bisaya" | "en">("bisaya");

  useEffect(() => {
    const savedTheme = sessionStorage.getItem("esmeringle_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const savedLang = sessionStorage.getItem("esmeringle_lang");
    if (savedLang === "en" || savedLang === "bisaya") {
      setLang(savedLang);
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            &larr; Back to esmiringle
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setLang(lang === "bisaya" ? "en" : "bisaya")}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold"
            >
              {lang === "bisaya" ? "Switch to English" : "Switch to Bisaya"}
            </button>
            <button
              onClick={toggleTheme}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition"
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <article className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {lang === "bisaya" ? "Mga Giya sa Kaluwasan & Komunidad" : "Community Guidelines & Safety"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === "bisaya"
                ? "Giunsa pagpabiling luwas, makalingaw, ug matinahuron ang pag-chat sa esmiringle."
                : "How to stay safe, respectful, and protected while chatting on esmiringle."}
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {lang === "bisaya" ? "1. Ang Bulawang Lagda: Ayaw Ihatag Imong Personal nga Impormasyon" : "1. The Golden Rule: Protect Your Personal Information"}
            </h2>
            <p>
              {lang === "bisaya"
                ? "Dili gayod maghatag sa imong tinuod nga ngalan, numero sa cellphone, social media handles (Facebook, Instagram, Telegram), o adres sa balay. Ang tinuod nga panag-istorya sa esmiringle kay kalingawan lang."
                : "Never disclose your real name, phone number, social media handles (Facebook, Instagram, Telegram), or address. Keep your conversations lighthearted and anonymous."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {lang === "bisaya" ? "2. Mga Lagda sa Komunidad" : "2. Core Community Rules"}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>{lang === "bisaya" ? "18+ Lamang:" : "Strictly 18+ Only:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Kinahanglang 18 anyos pataas aron mogamit sa esmiringle. Bawal ang menor de edad."
                  : "You must be 18 years or older. Minors are strictly prohibited."}
              </li>
              <li>
                <strong>{lang === "bisaya" ? "Walay Bastos o Nudity:" : "No Obscene Content:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Walay bastos, malaw-ay, o non-consensual nga sekswal nga mga mensahe."
                  : "Non-consensual sexually explicit text and solicitation are not allowed."}
              </li>
              <li>
                <strong>{lang === "bisaya" ? "Respeto sa Isigka-Tawo:" : "Kindness & Decency:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Walay bullying, panghulga, hate speech, o pagpangdaut sa ka-chat."
                  : "Treat everyone with respect. Zero tolerance for harassment, threats, or hate speech."}
              </li>
              <li>
                <strong>{lang === "bisaya" ? "Bawal ang Scam & Bots:" : "No Scams or Spam Bots:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Dili pwede magpadala og mga link sa pangilad, crypto schemes, o mangayo og kwarta/GCash."
                  : "No phishing links, commercial solicitation, or asking for money/GCash."}
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {lang === "bisaya" ? "3. Unsaon Pagpanalipod sa Kaugalingon?" : "3. Safety Tips"}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>{lang === "bisaya" ? "Pindota ang ESC / Skip:" : "Use ESC / Skip anytime:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Kung mobati kag dili maayo o dili komportable sa imong ka-chat, pindota dayon ang ESC o Skip para mangita og laing kastorya."
                  : "If you feel uncomfortable with someone, press ESC or click Skip immediately to connect with someone else."}
              </li>
              <li>
                <strong>{lang === "bisaya" ? "Gamita ang Report Button:" : "Use the Report button:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Kung abusado o bastos ang imong ka-chat, pindota ang 'Report' sa ibabaw aron ma-flag kini. Ang mga abusado awtomatikong ma-block."
                  : "If a user is abusive, click 'Report' in the header. Repeatedly reported users are temporarily blocked from connecting."}
              </li>
              <li>
                <strong>{lang === "bisaya" ? "100% Libre:" : "100% Free:"}</strong>{" "}
                {lang === "bisaya"
                  ? "Ang esmiringle walay bayad. Ayaw paghatag og kwarta o GCash bisan kinsa."
                  : "esmiringle is completely free. Anyone asking for payment, load, or donations is a scammer."}
              </li>
            </ul>
          </section>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              &larr; {lang === "bisaya" ? "Balik sa Chat" : "Back to Chat"}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
