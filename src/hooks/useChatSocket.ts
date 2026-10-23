"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ChatMessage,
  PartnerProfile,
  UserProfile,
  MatchStatus,
} from "../types/chat";
import { sound } from "../utils/audio";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function useChatSocket(profile: UserProfile | null) {
  const socketRef = useRef<Socket | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [isPartnerLeft, setIsPartnerLeft] = useState<boolean>(false);
  const [leftReason, setLeftReason] = useState<"skipped" | "disconnected" | "reported" | null>(null);

  // Keep refs for event callbacks to avoid stale state
  const statusRef = useRef(status);
  statusRef.current = status;
  const isPartnerLeftRef = useRef(isPartnerLeft);
  isPartnerLeftRef.current = isPartnerLeft;
  const hasConnectedOnceRef = useRef(false);

  // Initialize socket
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
    const socket = io(socketUrl, {
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
        // Query server to check if our room is still active
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

      // When phone sleeps or network drops, server cleans up room.
      // Flag chat as disconnected immediately.
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
          // If already connected, verify session is still active
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

  const startSearching = useCallback(() => {
    if (!socketRef.current || !profile) return;
    setPartner(null);
    setMessages([]);
    setIsPartnerLeft(false);
    setLeftReason(null);
    setIsPartnerTyping(false);
    setStatus("searching");
    socketRef.current.emit("join-queue", profile);
  }, [profile]);

  const cancelSearching = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("leave-queue");
    setStatus("idle");
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || !text.trim() || isPartnerLeftRef.current) return;
    socketRef.current.emit("send-message", { text });
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || isPartnerLeftRef.current) return;
    socketRef.current.emit("typing", isTyping);
  }, []);

  const skipPartner = useCallback(() => {
    if (!socketRef.current || !profile) return;
    socketRef.current.emit("skip-partner");
    // Immediately rejoin queue for quick continuous Omegle experience
    startSearching();
  }, [profile, startSearching]);

  const stopChat = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("skip-partner");
    setPartner(null);
    setStatus("idle");
  }, []);

  const reportPartner = useCallback((reason: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("report-partner", reason);
  }, []);

  return {
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
  };
}
