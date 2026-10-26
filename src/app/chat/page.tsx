"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "../../types/chat";
import { Language } from "../../utils/i18n";
import { useChatSocket } from "../../hooks/useChatSocket";
import MatchmakingRadar from "../../components/MatchmakingRadar";
import ChatViewport from "../../components/ChatViewport";

export default function ChatPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>("en");

  // Load profile and preferences on mount
  useEffect(() => {
    setIsClient(true);

    // Language setup - default to english
    const savedLang = sessionStorage.getItem("esmeringle_lang") as Language | null;
    if (savedLang === "bisaya" || savedLang === "en") {
      setLang(savedLang);
    } else {
      setLang("en");
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

    // Check profile
    try {
      const stored =
        sessionStorage.getItem("esmeringle_profile") ||
        sessionStorage.getItem("esmiringhoy_profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  }, [router]);

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
    const nextLang: Language = lang === "bisaya" ? "en" : "bisaya";
    setLang(nextLang);
    sessionStorage.setItem("esmeringle_lang", nextLang);
  };

  const {
    onlineCount,
    status,
    connectionStatus,
    partner,
    messages,
    isPartnerTyping,
    isPartnerLeft,
    leftReason,
    startSearching,
    cancelSearching,
    sendMessage,
    sendTyping,
    skipPartner,
    stopChat,
  } = useChatSocket(profile);

  const statusRef = useRef(status);
  statusRef.current = status;
  const hasStartedRef = useRef(false);
  const stopChatRef = useRef(stopChat);
  stopChatRef.current = stopChat;
  const cancelSearchingRef = useRef(cancelSearching);
  cancelSearchingRef.current = cancelSearching;

  // Auto-start searching once when profile is ready
  useEffect(() => {
    if (profile && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startSearching(profile);
    }
  }, [profile, startSearching]);

  // Clean up if component unmounts (e.g. back button or direct navigation)
  useEffect(() => {
    return () => {
      if (statusRef.current === "matched") {
        stopChatRef.current();
      } else if (statusRef.current === "searching") {
        cancelSearchingRef.current();
      }
    };
  }, []);

  const handleCancel = () => {
    cancelSearching();
    router.push("/");
  };

  const handleStop = () => {
    stopChat();
    router.push("/");
  };

  const handleSkip = useCallback(() => {
    skipPartner();
  }, [skipPartner]);

  if (!isClient || !profile) return null;

  return (
    <div
      className={`w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${
        status === "matched" && partner
          ? "fixed inset-0 h-[100dvh] w-full overflow-hidden flex flex-col sm:relative sm:min-h-screen sm:justify-center sm:p-4"
          : "min-h-screen flex flex-col justify-center p-4"
      }`}
    >
      {status === "matched" && partner ? (
        <ChatViewport
          userProfile={profile}
          partner={partner}
          messages={messages}
          isPartnerTyping={isPartnerTyping}
          isPartnerLeft={isPartnerLeft}
          leftReason={leftReason}
          connectionStatus={connectionStatus}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          onSkip={handleSkip}
          onNext={handleSkip}
          onStop={handleStop}
          lang={lang}
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto p-4">
          <MatchmakingRadar
            profile={profile}
            onlineCount={onlineCount}
            onCancel={handleCancel}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}
