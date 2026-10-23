"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  PartnerProfile,
  UserProfile,
  GENDER_ALIASES,
} from "../types/chat";
import { Language, translations } from "../utils/i18n";
import {
  Send,
  FastForward,
  Slash,
  ArrowRight,
  ArrowLeft,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { sound } from "../utils/audio";

interface ChatViewportProps {
  userProfile: UserProfile;
  partner: PartnerProfile;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  isPartnerLeft: boolean;
  leftReason?: "skipped" | "disconnected" | "reported" | null;
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onNext: () => void;
  onStop: () => void;
  lang?: Language;
  onToggleLang?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export default function ChatViewport({
  partner,
  messages,
  isPartnerTyping,
  isPartnerLeft,
  leftReason,
  onSendMessage,
  onTyping,
  onNext,
  onStop,
  lang = "bisaya",
  onToggleLang,
  onToggleTheme,
  isDarkMode,
}: ChatViewportProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];
  const partnerAlias = GENDER_ALIASES[partner.gender] || "Stranger";
  const article = partner.gender === "male" ? "a" : "an";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping, isPartnerLeft]);

  // Focus input
  useEffect(() => {
    if (!isPartnerLeft) {
      inputRef.current?.focus();
    }
  }, [isPartnerLeft, partner.roomId]);

  // ESC shortcut to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        sound.playClickSound();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isPartnerLeft) return;

    onSendMessage(inputText.trim());
    setInputText("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sound.playMessageSound();
  };

  return (
    <div className="flex flex-col h-full sm:h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full sm:rounded-2xl bg-white dark:bg-slate-900 sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:shadow-sm overflow-hidden transition-colors">
      {/* Messenger-style Top Header - Fixed & Pinned */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 shrink-0 select-none">
        {/* Left: Back Button + Avatar + Alias */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={() => {
              sound.playClickSound();
              onStop();
            }}
            title={t.leave}
            aria-label="Back"
            className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-2xl select-none">
            {partner.gender === "male"
              ? "👨"
              : partner.gender === "female"
                ? "👩"
                : "👤"}
          </span>

          <div className="leading-tight">
            <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{partnerAlias}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.connected}</span>
            </div>
          </div>
        </div>

        {/* Right: Language, Theme & Leave controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              aria-label="Toggle language"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition"
              title={
                lang === "bisaya" ? "Switch to English" : "Switch to Bisaya"
              }
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">
                {lang === "bisaya" ? "Bisaya" : "English"}
              </span>
              <span className="sm:hidden">
                {lang === "bisaya" ? "BIS" : "EN"}
              </span>
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area - ONLY this element scrolls */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5">
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {t.welcomeChat(partnerAlias, article)}
          </span>
        </div>

        {messages.map((msg) => {
          if (msg.senderType === "system") {
            return (
              <div key={msg.id} className="text-center my-1">
                <span className="text-xs text-slate-400">{msg.text}</span>
              </div>
            );
          }

          const isYou = msg.senderType === "you";
          const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isYou
                    ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                {formattedTime}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isPartnerTyping && !isPartnerLeft && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-1 py-1">
            <span>{t.typing(partnerAlias)}</span>
            <span className="flex space-x-0.5">
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-150" />
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-300" />
            </span>
          </div>
        )}

        {/* Stranger disconnected callout */}
        {isPartnerLeft && (
          <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center max-w-sm mx-auto space-y-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center">
              <Slash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.partnerDisconnected(partnerAlias)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {leftReason === "skipped"
                  ? t.partnerSkipped(partnerAlias)
                  : t.connectionEnded}
              </p>
            </div>
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 mx-auto shadow-sm"
            >
              <span className="sm:hidden">{lang === "bisaya" ? "Pangita og Bag-ong Kastorya" : "Find New Stranger"}</span>
              <span className="hidden sm:inline">{t.findNewStranger}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar - pinned cleanly at the bottom */}
      <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNext}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide transition flex items-center gap-1 shrink-0 ${
              isPartnerLeft
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{t.next}</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-black/10 dark:bg-white/10 text-[10px]">
              ESC
            </kbd>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            disabled={isPartnerLeft}
            placeholder={
              isPartnerLeft
                ? t.rematchPlaceholder(partnerAlias)
                : t.typePlaceholder
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isPartnerLeft}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
