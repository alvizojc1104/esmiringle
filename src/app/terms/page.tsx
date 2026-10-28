"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = sessionStorage.getItem("esmeringle_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
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
          <button
            onClick={toggleTheme}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <article className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Effective: October 2026 &bull; User Agreement
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              1. Age Requirement (18+ Only)
            </h2>
            <p>
              You must be at least 18 years old to access or use esmiringle. Use by minors is strictly prohibited. By accessing this service, you certify that you are of legal age.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. Nature of the Service
            </h2>
            <p>
              esmiringle provides spontaneous, random 1-on-1 anonymous text chat. Conversations are ephemeral and unmonitored in real-time by human operators. We do not verify the identity of strangers you are paired with. You use the service at your own sole risk and discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Prohibited Conduct
            </h2>
            <p>You agree not to use esmiringle to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Transmit unlawful, harassing, threatening, abusive, or defamatory messages.</li>
              <li>Share non-consensual sexually explicit or obscene material.</li>
              <li>Exploit, endanger, or solicit personal information from minors.</li>
              <li>Run automated scripts, bots, socket flooders, or spam campaigns.</li>
              <li>Distribute phishing links, deceptive financial schemes, or malicious software.</li>
              <li>Doxx or publish another person&apos;s personal identifiable information.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Reporting & Enforcement
            </h2>
            <p>
              Users may report misconduct directly in chat. Accounts or IP addresses that receive repeated community reports or trigger flood detection will be automatically blocked from connecting for temporary cooling-off periods.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. Disclaimer of Warranties
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. IN NO EVENT SHALL THE OPERATORS BE LIABLE FOR ANY DAMAGES ARISING FROM COMMUNICATIONS WITH STRANGERS ON THIS PLATFORM.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
