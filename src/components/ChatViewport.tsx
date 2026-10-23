"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  PartnerProfile,
  MatchStatus,
} from "../types/chat";
import { Language, translations } from "../utils/i18n";
import {
  Send,
  Flag,
  Square,
  Sun,
  Moon,
  Radio,
} from "lucide-react";
import { sound } from "../utils/audio";

interface ChatViewportProps {
  status: MatchStatus;
  onlineCount: number;
  partner: PartnerProfile | null;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  isPartnerLeft: boolean;
  leftReason?: "skipped" | "disconnected" | "reported" | null;
  connectionStatus?: "connected" | "reconnecting" | "disconnected";
  onStart: () => void;
  onStop: () => void;
  onSkip: () => void;
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onReport?: (reason: string) => void;
  lang?: Language;
  onToggleLang?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export default function ChatViewport({
  status,
  onlineCount,
  messages,
  isPartnerTyping,
  isPartnerLeft,
  leftReason,
  connectionStatus = "connected",
  onStart,
  onStop,
  onSkip,
  onSendMessage,
  onTyping,
  onReport,
  lang = "bisaya",
  onToggleLang,
  onToggleTheme,
  isDarkMode,
}: ChatViewportProps) {
  const [inputText, setInputText] = useState("");
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
  const [showReportToast, setShowReportToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[lang];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping, isPartnerLeft]);

  // Focus textarea when matched
  useEffect(() => {
    if (status === "matched" && !isPartnerLeft) {
      textareaRef.current?.focus();
    }
  }, [status, isPartnerLeft]);

  // Reset skip confirmation when status or partner changes
  useEffect(() => {
    setIsConfirmingSkip(false);
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
  }, [status, isPartnerLeft]);

  // ESC shortcut to Skip or Cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sound.playClickSound();
        if (status === "searching") {
          onStop();
        } else if (status === "matched") {
          handleSkipClick();
        } else if (status === "idle") {
          onStart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isPartnerLeft, isConfirmingSkip, onStart, onStop]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isPartnerLeft || status !== "matched") return;

    onSendMessage(inputText.trim());
    setInputText("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sound.playMessageSound();
  };

  // Two-step Skip logic: "Skip" -> "Really?" / "Sure oy?" -> execute
  // Color does not change, only text toggles!
  const handleSkipClick = () => {
    sound.playClickSound();

    // If partner already disconnected or left, immediately start new search without "Sure oy?"
    if (isPartnerLeft || status !== "matched") {
      setIsConfirmingSkip(false);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      onSkip();
      return;
    }

    if (isConfirmingSkip) {
      // Confirmed skip
      setIsConfirmingSkip(false);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      onSkip();
    } else {
      // First click: prompt confirmation (text changes only)
      setIsConfirmingSkip(true);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = setTimeout(() => {
        setIsConfirmingSkip(false);
      }, 3500);
    }
  };

  const handleReport = () => {
    sound.playClickSound();
    if (onReport) {
      onReport("inappropriate_behavior");
    }
    setShowReportToast(true);
    setTimeout(() => setShowReportToast(false), 3000);
    onSkip();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col h-[100dvh] sm:h-auto sm:min-h-[640px] sm:py-6 px-3 sm:px-0 justify-between select-none font-sans">
      {/* Top Header - Umingle Style */}
      <header className="flex items-center justify-between py-2 sm:py-3 px-1 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-192x192.png"
            alt="esmeringle logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs"
          />
          <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            {t.appName}
          </span>
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-2">
          {/* Online count badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onlineCount > 0 ? `${onlineCount.toLocaleString()}+` : "14,700+"}</span>
          </div>

          {/* Language Toggle (BIS / EN) */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              title={lang === "bisaya" ? "Switch to English" : "Switch to Bisaya"}
            >
              {lang === "bisaya" ? "BIS" : "EN"}
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Umingle Card with Reduced Round Borders */}
      <main className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden my-2">
        {/* Red Flag Icon in Top-Right */}
        <button
          onClick={handleReport}
          title={t.reportStranger}
          disabled={status !== "matched"}
          className="absolute top-3.5 right-3.5 p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition disabled:opacity-30 z-20"
        >
          <Flag className="w-5 h-5 fill-rose-500/10 stroke-rose-500 stroke-[2.2]" />
        </button>

        {/* Card Body - Content based on status */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 flex flex-col justify-end">
          {/* STATE 1: IDLE - Umingle Welcome Card */}
          {status === "idle" && (
            <div className="space-y-3.5 text-slate-900 dark:text-slate-100 my-auto sm:my-0 sm:mt-auto">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t.welcomeTitle}
              </h2>

              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold">
                  18+
                </span>
                <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                  {t.ageNotice}
                </span>
              </div>

              <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                <p>{t.ruleNoNudity}</p>
                <p>{t.ruleCamera}</p>
                <p>{t.ruleRespect}</p>
                <p className="font-bold text-slate-900 dark:text-white pt-1">
                  {t.ruleViolators}
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: SEARCHING - Radar Pulse */}
          {status === "searching" && (
            <div className="my-auto flex flex-col items-center justify-center text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <Radio className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t.lookingForStranger}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.connectingOnline}
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: MATCHED - Transcript Log (Philippines removed) */}
          {status === "matched" && (
            <div className="space-y-2 select-text w-full">
              {/* Notice top banner */}
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pt-1 pb-1">
                <span>✨</span>
                <span>{t.chattingWithSomeoneNew}</span>
              </div>

              {/* Message transcript */}
              {messages.map((msg) => {
                if (msg.senderType === "system") {
                  return (
                    <div key={msg.id} className="text-xs font-bold text-slate-800 dark:text-slate-200 py-0.5">
                      {msg.text}
                    </div>
                  );
                }

                const isYou = msg.senderType === "you";
                return (
                  <div key={msg.id} className="text-sm leading-relaxed break-words">
                    <span className={`font-bold ${isYou ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
                      {isYou ? `${t.youLabel}: ` : `${t.strangerLabel}: `}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {msg.text}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isPartnerTyping && !isPartnerLeft && (
                <div className="text-xs text-slate-400 dark:text-slate-500 italic py-0.5">
                  {t.typingStranger}
                </div>
              )}

              {/* Disconnection notice */}
              {isPartnerLeft && (
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 pt-1">
                  {leftReason === "skipped"
                    ? t.strangerSkipped
                    : t.strangerDisconnected}
                </div>
              )}

              {connectionStatus === "reconnecting" && (
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold pt-1">
                  Reconnecting...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Report toast */}
        {showReportToast && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg z-30 animate-fade-in">
            {t.reportedToast}
          </div>
        )}
      </main>

      {/* Bottom Controls Bar with 3-line Text-Field and Matching Buttons */}
      <footer className="space-y-2 shrink-0 pt-1">
        <form onSubmit={handleSend} className="flex items-stretch gap-2">
          {/* Action Button: Start / Stop / Skip - Stretches to match textarea height exactly */}
          {status === "idle" ? (
            <button
              type="button"
              onClick={() => {
                sound.playClickSound();
                onStart();
              }}
              className="px-5 sm:px-6 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm sm:text-base transition shadow-sm shrink-0 flex items-center justify-center self-stretch"
            >
              {t.start}
            </button>
          ) : status === "searching" ? (
            <button
              type="button"
              onClick={() => {
                sound.playClickSound();
                onStop();
              }}
              className="px-5 sm:px-6 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-sm transition shrink-0 flex items-center justify-center self-stretch"
            >
              {t.stop}
            </button>
          ) : isPartnerLeft ? (
            /* When partner disconnected, button becomes Start */
            <button
              type="button"
              onClick={() => {
                sound.playClickSound();
                onStart();
              }}
              className="px-5 sm:px-6 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm sm:text-base transition shadow-sm shrink-0 flex items-center justify-center self-stretch"
            >
              {t.start}
            </button>
          ) : (
            /* Active chat: Skip button (color NEVER changes, only text) + Stop square button */
            <div className="flex items-stretch gap-1.5 shrink-0 self-stretch">
              <button
                type="button"
                onClick={handleSkipClick}
                className="px-4 sm:px-5 rounded-md font-bold text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 active:scale-95 flex items-center justify-center"
              >
                {isConfirmingSkip ? t.skipConfirm : t.skip}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  onStop();
                }}
                title={t.stop}
                aria-label="Stop chat"
                className="w-11 sm:w-12 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center shrink-0 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-slate-700 dark:fill-slate-300" />
              </button>
            </div>
          )}

          {/* Text-Field with minimum of 3 lines */}
          <div className="relative flex-1 flex self-stretch">
            <textarea
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={status !== "matched" || isPartnerLeft}
              placeholder={
                status === "matched" && !isPartnerLeft
                  ? t.typePlaceholder
                  : status === "searching"
                    ? t.lookingForStranger
                    : ""
              }
              className="w-full h-full min-h-[4.75rem] sm:min-h-[5rem] pl-3.5 pr-11 py-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-40 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 resize-none transition shadow-2xs leading-relaxed"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || status !== "matched" || isPartnerLeft}
              aria-label="Send message"
              className="absolute right-2.5 bottom-2.5 p-2 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-30 disabled:hover:bg-transparent transition"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </div>
        </form>

        {/* Minimal Footer Watermark */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 pb-1">
          © esmeringle 2026 | quickchow | v1.0
        </div>
      </footer>
    </div>
  );
}
