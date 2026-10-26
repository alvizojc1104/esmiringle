"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  ChatMessage,
  PartnerProfile,
  UserProfile,
  GENDER_ALIASES,
} from "../types/chat";
import { Language, translations } from "../utils/i18n";
import {
  Send,
  Slash,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { sound } from "../utils/audio";
import CharLimitModal from "./CharLimitModal";

interface ChatViewportProps {
  userProfile: UserProfile;
  partner: PartnerProfile;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  isPartnerLeft: boolean;
  leftReason?: "skipped" | "disconnected" | "reported" | null;
  connectionStatus?: "connected" | "reconnecting" | "disconnected";
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onSkip?: () => void;
  onNext?: () => void;
  onStop: () => void;
  lang?: Language;
  onToggleLang?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

const MAX_CHAR_LIMIT = 1000;

export default function ChatViewport({
  userProfile,
  partner,
  messages,
  isPartnerTyping,
  isPartnerLeft,
  leftReason,
  connectionStatus,
  onSendMessage,
  onTyping,
  onSkip,
  onNext,
  onStop,
  lang = "bisaya",
  onToggleLang,
  onToggleTheme,
  isDarkMode,
}: ChatViewportProps) {
  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else if (onNext) {
      onNext();
    }
  }, [onSkip, onNext]);

  const [inputText, setInputText] = useState("");
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
  const [isCharLimitModalOpen, setIsCharLimitModalOpen] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipConfirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const t = translations[lang];
  const partnerAlias = GENDER_ALIASES[partner.gender] || "Stranger";
  const article = partner.gender === "male" ? "a" : "an";

  const resetSkipConfirm = useCallback(() => {
    setIsConfirmingSkip(false);
    if (skipConfirmTimeoutRef.current) {
      clearTimeout(skipConfirmTimeoutRef.current);
      skipConfirmTimeoutRef.current = null;
    }
  }, []);

  // Reset confirmation state on partner/room change or unmount
  useEffect(() => {
    resetSkipConfirm();
    return () => {
      if (skipConfirmTimeoutRef.current) {
        clearTimeout(skipConfirmTimeoutRef.current);
      }
    };
  }, [partner.roomId, resetSkipConfirm]);

  const handleSkipRequest = useCallback(() => {
    // If partner already left, skip immediately
    if (isPartnerLeft) {
      resetSkipConfirm();
      handleSkip();
      return;
    }

    // If already in confirming state ("Sure?"), execute the skip
    if (isConfirmingSkip) {
      resetSkipConfirm();
      handleSkip();
    } else {
      // First click: prompt "Sure?"
      sound.playClickSound();
      setIsConfirmingSkip(true);
      if (skipConfirmTimeoutRef.current) {
        clearTimeout(skipConfirmTimeoutRef.current);
      }
      skipConfirmTimeoutRef.current = setTimeout(() => {
        setIsConfirmingSkip(false);
      }, 4000);
    }
  }, [isPartnerLeft, isConfirmingSkip, handleSkip, resetSkipConfirm]);

  // Focus input on mount or partner change
  useEffect(() => {
    if (!isPartnerLeft) {
      inputRef.current?.focus();
    }
  }, [isPartnerLeft, partner.roomId]);

  // Scroll to bottom when partner types or disconnects
  useEffect(() => {
    if (isPartnerTyping || isPartnerLeft) {
      virtuosoRef.current?.scrollToIndex({
        index: "LAST",
        align: "end",
        behavior: "smooth",
      });
    }
  }, [isPartnerTyping, isPartnerLeft]);

  // ESC shortcut to skip with confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkipRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkipRequest]);

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

    // Check if character limit is exceeded
    if (inputText.length > MAX_CHAR_LIMIT) {
      setIsCharLimitModalOpen(true);
      return;
    }

    onSendMessage(inputText.trim());
    setInputText("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sound.playMessageSound();
  };

  const handleTrimMessage = () => {
    setInputText((prev) => prev.slice(0, MAX_CHAR_LIMIT));
    setIsCharLimitModalOpen(false);
    inputRef.current?.focus();
  };

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      align: "end",
      behavior: "smooth",
    });
    setShowScrollBottomBtn(false);
  }, []);

  return (
    <div className="flex flex-col h-full sm:h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full sm:rounded-2xl bg-white dark:bg-slate-900 sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:shadow-sm overflow-hidden transition-colors relative">
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
            {connectionStatus === "reconnecting" ? (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{t.reconnecting}</span>
              </div>
            ) : connectionStatus === "disconnected" || isPartnerLeft ? (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>
                  {isPartnerLeft && leftReason === "skipped"
                    ? (lang === "bisaya" ? "Ni-skip ang ka-chat" : "Partner skipped")
                    : t.disconnectedStatus}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.connected}</span>
              </div>
            )}
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

      {/* react-virtuoso Virtualized Message Viewport */}
      <div className="flex-1 min-h-0 w-full relative">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          className="h-full w-full"
          atBottomThreshold={80}
          atBottomStateChange={(atBottom) => {
            setShowScrollBottomBtn(!atBottom);
          }}
          followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
          components={{
            Header: () => (
              <div className="text-center my-3 px-4 select-none">
                <span className="inline-block px-3 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {t.welcomeChat(partnerAlias, article)}
                </span>
              </div>
            ),
            Footer: () => (
              <div className="pb-3 px-4">
                {/* Typing indicator */}
                {isPartnerTyping && !isPartnerLeft && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-1 py-1 mt-2">
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
                        {leftReason === "disconnected"
                          ? (lang === "bisaya" ? "Nawad-an og koneksyon" : "Connection lost")
                          : t.partnerDisconnected(partnerAlias)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        {leftReason === "disconnected"
                          ? t.connectionLostDesc
                          : leftReason === "skipped"
                            ? t.partnerSkipped(partnerAlias)
                            : t.connectionEnded}
                      </p>
                    </div>
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 mx-auto shadow-sm"
                    >
                      <span className="sm:hidden">{lang === "bisaya" ? "Skip / Pangitag Lain" : "Skip Stranger"}</span>
                      <span className="hidden sm:inline">{t.findNewStranger}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ),
          }}
          itemContent={(index, msg) => {
            if (msg.senderType === "system") {
              const isWarning = msg.text.startsWith("⚠️");
              return (
                <div className="text-center my-2 px-4 sm:px-5">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-xs ${
                      isWarning
                        ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-medium"
                        : "text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {msg.text}
                  </span>
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
                className={`flex flex-col py-1.5 px-4 sm:px-5 ${isYou ? "items-end" : "items-start"}`}
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
          }}
        />

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottomBtn && (
          <button
            onClick={scrollToBottom}
            aria-label="Scroll to newest messages"
            className="absolute bottom-4 right-4 sm:right-6 z-30 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{t.newMessagesBelow}</span>
          </button>
        )}
      </div>

      {/* Input bar - pinned cleanly at the bottom */}
      <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Dynamic character counter: appears when approaching or exceeding 1,000 chars */}
        {inputText.length > 800 && (
          <div className="flex justify-end px-1 pb-1">
            <span
              className={`text-[11px] font-medium transition-colors ${
                inputText.length > MAX_CHAR_LIMIT
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : inputText.length > 950
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-slate-400"
              }`}
            >
              {inputText.length.toLocaleString()} / {MAX_CHAR_LIMIT.toLocaleString()}
            </span>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkipRequest}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide transition flex items-center justify-center gap-1 shrink-0 ${
              isPartnerLeft
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>{isConfirmingSkip ? "Sure?" : t.skip}</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-black/10 dark:bg-white/10 text-[10px]">
              ESC
            </kbd>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            disabled={isPartnerLeft || connectionStatus !== "connected"}
            placeholder={
              connectionStatus === "reconnecting"
                ? t.reconnecting
                : isPartnerLeft
                  ? (leftReason === "disconnected"
                      ? (lang === "bisaya" ? "Nawala ang koneksyon. Pindota ang Skip..." : "Disconnected. Click Skip to rematch...")
                      : t.rematchPlaceholder(partnerAlias))
                  : t.typePlaceholder
            }
            className={`flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm outline-none disabled:opacity-50 transition ${
              inputText.length > MAX_CHAR_LIMIT
                ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isPartnerLeft || connectionStatus !== "connected"}
            aria-label="Send message"
            className={`p-2.5 rounded-xl text-white transition shadow-sm shrink-0 disabled:opacity-40 ${
              inputText.length > MAX_CHAR_LIMIT
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Character Limit Modal */}
      <CharLimitModal
        isOpen={isCharLimitModalOpen}
        charCount={inputText.length}
        maxChars={MAX_CHAR_LIMIT}
        onTrim={handleTrimMessage}
        onClose={() => {
          setIsCharLimitModalOpen(false);
          inputRef.current?.focus();
        }}
        lang={lang}
      />
    </div>
  );
}
