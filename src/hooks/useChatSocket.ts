"use client";

import { useRef, useCallback } from "react";
import { UserProfile } from "../types/chat";
import { useSocket, ConnectionStatus } from "../context/SocketContext";

export type { ConnectionStatus };

export function useChatSocket(profile: UserProfile | null) {
  const context = useSocket();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Extract stable action functions to avoid re-triggering callbacks on state changes
  const contextStartSearching = context.startSearching;
  const contextSkipPartner = context.skipPartner;

  const startSearching = useCallback(
    (overrideProfile?: UserProfile | null) => {
      const p = overrideProfile || profileRef.current;
      contextStartSearching(p);
    },
    [contextStartSearching]
  );

  const skipPartner = useCallback(
    (overrideProfile?: UserProfile | null) => {
      const p = overrideProfile || profileRef.current;
      contextSkipPartner(p);
    },
    [contextSkipPartner]
  );

  return {
    ...context,
    startSearching,
    skipPartner,
  };
}
