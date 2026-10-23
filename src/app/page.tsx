"use client";

import React, { useState, useEffect } from "react";
import { Language } from "../utils/i18n";
import { Gender } from "../types/chat";
import { useChatSocket } from "../hooks/useChatSocket";
import ChatViewport from "../components/ChatViewport";
import { sound } from "../utils/audio";

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>("bisaya");
  const [gender, setGender] = useState<Gender>("undisclosed");

  // Load preferences from sessionStorage
  useEffect(() => {
    setIsClient(true);

    const savedLang = sessionStorage.getItem("esmeringle_lang") as Language | null;
    if (savedLang === "bisaya" || savedLang === "en") {
      setLang(savedLang);
    } else {
      setLang("bisaya");
    }

    const savedGender = sessionStorage.getItem("esmeringle_gender") as Gender | null;
    if (savedGender === "male" || savedGender === "female" || savedGender === "undisclosed") {
      setGender(savedGender);
    }

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

  const toggleLang = () => {
    sound.playClickSound();
    const nextLang: Language = lang === "bisaya" ? "en" : "bisaya";
    setLang(nextLang);
    sessionStorage.setItem("esmeringle_lang", nextLang);
  };

  const handleGenderChange = (selectedGender: Gender) => {
    setGender(selectedGender);
    sessionStorage.setItem("esmeringle_gender", selectedGender);
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
    reportPartner,
  } = useChatSocket();

  if (!isClient) return null;

  return (
    <div className="h-[100dvh] overflow-hidden sm:h-auto sm:min-h-[100dvh] sm:overflow-visible bg-slate-50 dark:bg-slate-950 flex flex-col justify-center sm:px-4">
      <ChatViewport
        status={status}
        onlineCount={onlineCount}
        partner={partner}
        messages={messages}
        isPartnerTyping={isPartnerTyping}
        isPartnerLeft={isPartnerLeft}
        leftReason={leftReason}
        connectionStatus={connectionStatus}
        onStart={(selectedGender?: Gender) => startSearching(selectedGender || gender)}
        onStop={stopChat}
        onSkip={skipPartner}
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        onReport={reportPartner}
        lang={lang}
        onToggleLang={toggleLang}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        gender={gender}
        onSelectGender={handleGenderChange}
      />
    </div>
  );
}
