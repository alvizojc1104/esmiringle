"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  ChatMessage,
  PartnerProfile,
  UserProfile,
  MatchStatus,
} from "../types/chat";
import { sound } from "../utils/audio";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export interface SocketContextValue {
  socket: Socket | null;
  onlineCount: number;
  status: MatchStatus;
  connectionStatus: ConnectionStatus;
  partner: PartnerProfile | null;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  isPartnerLeft: boolean;
  leftReason: "skipped" | "disconnected" | "reported" | null;
  startSearching: (profile?: UserProfile | null) => void;
  cancelSearching: () => void;
  sendMessage: (text: string) => void;
  sendTyping: (isTyping: boolean) => void;
  skipPartner: (profile?: UserProfile | null) => void;
  stopChat: () => void;
  reportPartner: (reason: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem("esmeringle_sid");
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem("esmeringle_sid", sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [isPartnerLeft, setIsPartnerLeft] = useState<boolean>(false);
  const [leftReason, setLeftReason] = useState<"skipped" | "disconnected" | "reported" | null>(null);

  // Keep refs for event callbacks to avoid stale closures or dependency loops
  const statusRef = useRef(status);
  statusRef.current = status;
  const isPartnerLeftRef = useRef(isPartnerLeft);
  isPartnerLeftRef.current = isPartnerLeft;
  const hasConnectedOnceRef = useRef(false);
  const lastSendTimeRef = useRef(0);
  const activeProfileRef = useRef<UserProfile | null>(null);

  // Initialize single persistent socket on client mount
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
    const socket = io(socketUrl, {
      auth: { sessionId: getSessionId() },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SOCKET] Connected with ID:", socket.id);
      setConnectionStatus("connected");

      // If reconnecting after a disconnect while in active chat
      if (hasConnectedOnceRef.current && statusRef.current === "matched" && !isPartnerLeftRef.current) {
        socket.emit("check-match", (res: { active: boolean }) => {
          if (!res?.active) {
            setIsPartnerLeft(true);
            setLeftReason("disconnected");
            sound.playDisconnectSound();
          }
        });
      }
      hasConnectedOnceRef.current = true;
    });

    socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Disconnected, reason:", reason);
      setConnectionStatus("disconnected");

      if (statusRef.current === "matched") {
        setIsPartnerLeft(true);
        setLeftReason("disconnected");
        sound.playDisconnectSound();
      }
    });

    socket.on("connect_error", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_failed", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("online-count", (count: number) => {
      setOnlineCount(count);
    });

    socket.on("matched", (partnerData: PartnerProfile) => {
      console.log("[SOCKET] Matched with partner:", partnerData);
      setPartner(partnerData);
      setMessages([]);
      setIsPartnerTyping(false);
      setIsPartnerLeft(false);
      setLeftReason(null);
      setStatus("matched");
      sound.playMatchSound();
    });

    socket.on("partner-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setIsPartnerTyping(false);
      sound.playMessageSound();
    });

    socket.on("message-sent", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("partner-typing", (typing: boolean) => {
      setIsPartnerTyping(typing);
    });

    socket.on("partner-left", (data: { reason: "skipped" | "disconnected" | "reported" }) => {
      setIsPartnerLeft(true);
      setLeftReason(data.reason);
      setIsPartnerTyping(false);
      sound.playDisconnectSound();
    });

    socket.on("queue-status", (data: { status: string }) => {
      if (data.status === "waiting") {
        setStatus("searching");
      } else if (data.status === "idle") {
        setStatus("idle");
      }
    });

    socket.on("rate-limited", (data: { message: string; retryAfterMs: number }) => {
      console.warn("[SOCKET] Rate limited:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: `ratelimit_${Date.now()}`,
          senderId: "system",
          senderType: "system",
          text: `⚠️ ${data.message || "You are sending messages too fast. Please slow down."}`,
          timestamp: Date.now(),
        },
      ]);
    });

    // Handle mobile phone unlock & tab focus (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[SOCKET] Page became visible, socket connected:", socket.connected);
        if (!socket.connected) {
          setConnectionStatus("reconnecting");
          if (statusRef.current === "matched") {
            setIsPartnerLeft(true);
            setLeftReason("disconnected");
            sound.playDisconnectSound();
          }
          socket.connect();
        } else if (statusRef.current === "matched" && !isPartnerLeftRef.current) {
          socket.emit("check-match", (res: { active: boolean }) => {
            if (!res?.active) {
              setIsPartnerLeft(true);
              setLeftReason("disconnected");
              sound.playDisconnectSound();
            }
          });
        }
      }
    };

    const handleOffline = () => {
      setConnectionStatus("disconnected");
      if (statusRef.current === "matched") {
        setIsPartnerLeft(true);
        setLeftReason("disconnected");
        sound.playDisconnectSound();
      }
    };

    const handleOnline = () => {
      setConnectionStatus("reconnecting");
      socket.connect();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      socket.disconnect();
    };
  }, []);

  // Stable action callbacks with empty dependencies ([]) to prevent infinite re-renders or call depth exceeded
  const startSearching = useCallback((profileToUse?: UserProfile | null) => {
    const prof = profileToUse || activeProfileRef.current;
    if (!socketRef.current || !prof) return;
    // Guard against duplicate start calls if already searching
    if (statusRef.current === "searching") return;

    activeProfileRef.current = prof;
    setPartner(null);
    setMessages([]);
    setIsPartnerLeft(false);
    setLeftReason(null);
    setIsPartnerTyping(false);
    setStatus("searching");
    socketRef.current.emit("join-queue", prof);
  }, []);

  const cancelSearching = useCallback(() => {
    if (!socketRef.current) return;
    if (statusRef.current === "idle") return;

    socketRef.current.emit("leave-queue");
    setStatus("idle");
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || !text.trim() || isPartnerLeftRef.current) return;
    const now = Date.now();
    if (now - lastSendTimeRef.current < 250) {
      return;
    }
    lastSendTimeRef.current = now;
    socketRef.current.emit("send-message", { text: text.trim().slice(0, 1000) });
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || isPartnerLeftRef.current) return;
    socketRef.current.emit("typing", isTyping);
  }, []);

  const skipPartner = useCallback((profileToUse?: UserProfile | null) => {
    if (!socketRef.current) return;
    const prof = profileToUse || activeProfileRef.current;
    socketRef.current.emit("skip-partner");
    setPartner(null);
    setMessages([]);
    setIsPartnerLeft(false);
    setLeftReason(null);
    setIsPartnerTyping(false);

    if (prof) {
      activeProfileRef.current = prof;
      setStatus("searching");
      socketRef.current.emit("join-queue", prof);
    } else {
      setStatus("idle");
    }
  }, []);

  const stopChat = useCallback(() => {
    if (!socketRef.current) return;
    if (statusRef.current === "matched") {
      socketRef.current.emit("skip-partner");
    } else if (statusRef.current === "searching") {
      socketRef.current.emit("leave-queue");
    }
    setPartner(null);
    setStatus("idle");
  }, []);

  const reportPartner = useCallback((reason: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("report-partner", reason);
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: socketRef.current,
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
    }),
    [
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
    ]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
