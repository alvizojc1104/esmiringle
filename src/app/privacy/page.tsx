"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Last updated: October 2026 &bull; Philippine Data Privacy Act of 2012 (RA 10173) compliance
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              1. Overview & Principles
            </h2>
            <p>
              esmiringle is an anonymous, real-time 1-on-1 text communication platform. We believe personal privacy is fundamental. The application is built with a strict data-minimization architecture: we do not require accounts, we do not require passwords or email addresses, and we do not store chat logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. Information We Do Not Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>No user accounts, real names, phone numbers, or emails.</li>
              <li>No persistent chat logs: messages are routed in-memory through WebSockets and are not written to disk or database.</li>
              <li>No audio recordings or personal media files.</li>
              <li>No advertising cookies, behavioral tracking scripts, or data brokers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Information Handled During Your Session
            </h2>
            <p>
              To establish and maintain your connection, the system processes minimal technical data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>IP Address:</strong> Evaluated in server memory purely for connection management, rate-limiting (preventing flood attacks), and temporary abuse mitigation. IP data is never saved to a persistent database.
              </li>
              <li>
                <strong>Browser Session Storage:</strong> Your chosen alias (Dawg, Amiga, Anon), theme preference, and language setting are kept in your browser&apos;s sessionStorage while the tab is open.
              </li>
              <li>
                <strong>Device Identifier:</strong> A randomly generated pseudonymous identifier (esmeringle_did) is kept in localStorage solely to cleanly reconnect dropped mobile socket sessions.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Philippine Data Privacy Act of 2012 (RA 10173)
            </h2>
            <p>
              In accordance with RA 10173, esmiringle adheres to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Transparency:</strong> You are informed upfront that chats are ephemeral and unpersisted, while IP addresses are used solely for real-time security.
              </li>
              <li>
                <strong>Legitimate Purpose:</strong> Processing technical network metadata is strictly limited to defending against denial-of-service attacks, spam, and abuse.
              </li>
              <li>
                <strong>Proportionality:</strong> We retain only the bare minimum technical data in RAM, and discard it upon disconnection or server cycle.
              </li>
              <li>
                <strong>Data Subject Rights:</strong> Because all chat sessions are strictly anonymous and not archived, historical conversations cannot be retrieved or exported. You may delete all local browser tokens at any time by clearing your browser cache.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. Contact & Questions
            </h2>
            <p>
              If you have any questions about this privacy statement, you can reach out via our GitHub repository or at mikealvizo.dev.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
