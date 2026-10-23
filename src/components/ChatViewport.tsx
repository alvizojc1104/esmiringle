"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  PartnerProfile,
  MatchStatus,
  Gender,
} from "../types/chat";
import { Language, translations } from "../utils/i18n";
import {
  Send,
  Flag,
  Square,
  Sun,
  Moon,
  Radio,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
  onStart: (gender?: Gender) => void;
  onStop: () => void;
  onSkip: () => void;
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onReport?: (reason: string) => void;
  lang?: Language;
  onToggleLang?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  gender?: Gender;
  onSelectGender?: (gender: Gender) => void;
}

export default function ChatViewport({
  status,
  onlineCount,
  partner,
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
  gender = "undisclosed",
  onSelectGender,
}: ChatViewportProps) {
  const [inputText, setInputText] = useState("");
  const [selectedGender, setSelectedGender] = useState<Gender>(gender);
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
  const [showReportToast, setShowReportToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[lang];

  // Sync selectedGender if prop changes
  useEffect(() => {
    if (gender) setSelectedGender(gender);
  }, [gender]);

  // Scroll message container to bottom on new messages without triggering window scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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
          handleStart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isPartnerLeft, isConfirmingSkip, onStart, onStop, selectedGender]);

  const handleGenderChange = (newGender: Gender) => {
    sound.playClickSound();
    setSelectedGender(newGender);
    if (onSelectGender) onSelectGender(newGender);
    try {
      sessionStorage.setItem("esmeringle_gender", newGender);
    } catch (_) {}
  };

  const handleStart = () => {
    sound.playClickSound();
    onStart(selectedGender);
  };

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

    if (isPartnerLeft || status !== "matched") {
      setIsConfirmingSkip(false);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      onSkip();
      return;
    }

    if (isConfirmingSkip) {
      setIsConfirmingSkip(false);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      onSkip();
    } else {
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
    <div className="w-full max-w-lg mx-auto flex flex-col h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-none sm:min-h-[640px] sm:py-6 px-3 sm:px-0 justify-between font-sans overflow-hidden sm:overflow-visible">
      {/* Top Header - esmeringle Branding */}
      <header className="flex items-center justify-between py-2 sm:py-3 px-1 shrink-0 select-none">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-192x192.png"
            alt="esmeringle logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              {t.appName}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200/60 dark:border-blue-900/60">
              live
            </span>
          </div>
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

      {/* Main esmeringle Card */}
      <main className="relative flex-1 min-h-0 sm:min-h-[460px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden my-1 sm:my-2">
        {/* Card Body */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3.5 sm:p-4">
          {/* STATE 1: IDLE - Redesigned esmeringle Welcome Card with Gender Selection & Safety Precautions */}
          {status === "idle" && (
            <div className="min-h-full flex flex-col justify-between space-y-3.5">
              {/* Welcome Headline */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-600 dark:text-blue-300">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>100% Anonymous Chat</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t.welcomeTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t.welcomeSubtitle}
                </p>
              </div>

              {/* Gender Selection: 3 Options */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{t.genderPrompt}</span>
                  <span className="text-[11px] font-normal text-slate-400">Selected identity</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Male */}
                  <button
                    type="button"
                    onClick={() => handleGenderChange("male")}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-bold transition-all ${
                      selectedGender === "male"
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30 scale-[1.01]"
                        : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-base mb-0.5">♂️</span>
                    <span>{t.genderMale}</span>
                  </button>

                  {/* Female */}
                  <button
                    type="button"
                    onClick={() => handleGenderChange("female")}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-bold transition-all ${
                      selectedGender === "female"
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30 scale-[1.01]"
                        : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-base mb-0.5">♀️</span>
                    <span>{t.genderFemale}</span>
                  </button>

                  {/* Prefer not to say */}
                  <button
                    type="button"
                    onClick={() => handleGenderChange("undisclosed")}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-bold transition-all ${
                      selectedGender === "undisclosed"
                        ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30 scale-[1.01]"
                        : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-base mb-0.5">👤</span>
                    <span className="truncate max-w-[85px]">{t.genderUndisclosed}</span>
                  </button>
                </div>
              </div>

              {/* Safety & Community Precautions Box */}
              <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{t.precautionsTitle}</span>
                </div>
                <ul className="space-y-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-500 shrink-0">18+</span>
                    <span>{t.rule18Plus}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="shrink-0">🛡️</span>
                    <span>{t.ruleZeroTolerance}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="shrink-0">🔒</span>
                    <span>{t.rulePrivacy}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="shrink-0">⚡</span>
                    <span>{t.ruleModeration}</span>
                  </li>
                </ul>
              </div>

              {/* Start Button Inside Idle Card */}
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>{t.startChatting}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE 2: SEARCHING - Radar Pulse */}
          {status === "searching" && (
            <div className="min-h-full flex flex-col items-center justify-center text-center space-y-3.5 p-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 dark:bg-blue-400/10 animate-ping" />
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center z-10">
                  <Radio className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t.lookingForStranger}
                </p>
                <p className="text-xs text-slate-400">
                  {t.connectingOnline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  onStop();
                }}
                className="px-4 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                {t.stop}
              </button>
            </div>
          )}

          {/* STATE 3: MATCHED - Compact Transcript Log */}
          {status === "matched" && (
            <div className="min-h-full flex flex-col">
              {/* Partner Banner in Matched State */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {t.chattingWith(partner?.gender)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/50 dark:border-blue-900/50">
                    Ephemeral
                  </span>
                </div>

                {/* Report button */}
                <button
                  onClick={handleReport}
                  title={t.reportStranger}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                >
                  <Flag className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Message Transcript with Safe mt-auto */}
              <div className="mt-auto space-y-0.5 select-text w-full text-xs sm:text-[13px] leading-tight sm:leading-snug">
                {/* Notice top banner */}
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-1">
                  <span>✨</span>
                  <span>{t.chattingWithSomeoneNew}</span>
                </div>

                {/* Messages */}
                {messages.map((msg) => {
                  if (msg.senderType === "system") {
                    return (
                      <div key={msg.id} className="font-bold text-slate-800 dark:text-slate-200 py-0.5">
                        {msg.text}
                      </div>
                    );
                  }

                  const isYou = msg.senderType === "you";
                  return (
                    <div key={msg.id} className="break-words leading-tight sm:leading-snug">
                      <span className={`font-bold ${isYou ? "text-blue-600 dark:text-blue-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                        {isYou ? `${t.youLabel}: ` : `${t.strangerLabel}: `}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100 font-normal">
                        {msg.text}
                      </span>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isPartnerTyping && !isPartnerLeft && (
                  <div className="text-slate-400 dark:text-slate-500 italic text-[11px] sm:text-xs">
                    {t.typingStranger}
                  </div>
                )}

                {/* Disconnection notice */}
                {isPartnerLeft && (
                  <div className="font-bold text-slate-900 dark:text-slate-100 pt-1.5">
                    {leftReason === "skipped"
                      ? t.strangerSkipped
                      : t.strangerDisconnected}
                  </div>
                )}

                {connectionStatus === "reconnecting" && (
                  <div className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
                    Reconnecting...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Report toast */}
        {showReportToast && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg z-30 animate-fade-in flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.reportedToast}</span>
          </div>
        )}
      </main>

      {/* Bottom Controls Bar with 3-line Text-Field and Matching Buttons */}
      <footer className="space-y-1.5 shrink-0 pt-1">
        <form onSubmit={handleSend} className="flex items-stretch gap-2">
          {/* Action Button: Start / Stop / Skip - Stretches to match textarea height exactly */}
          {status === "idle" ? (
            <button
              type="button"
              onClick={handleStart}
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
              onClick={handleStart}
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
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider pt-0.5 select-none">
          © esmeringle 2026 | quickchow | v1.0
        </div>
      </footer>
    </div>
  );
}
