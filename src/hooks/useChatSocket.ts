"use client";

import { useRef, useCallback } from "react";
import { UserProfile } from "../types/chat";
import { useSocket, ConnectionStatus } from "../context/SocketContext";

export type { ConnectionStatus };

export function useChatSocket(profile: UserProfile | null) {
  const context = useSocket();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const startSearching = useCallback(
    (overrideProfile?: UserProfile | null) => {
      const p = overrideProfile || profileRef.current;
      context.startSearching(p);
    },
    [context]
  );

  const skipPartner = useCallback(
    (overrideProfile?: UserProfile | null) => {
      const p = overrideProfile || profileRef.current;
      context.skipPartner(p);
    },
    [context]
  );

  return {
    ...context,
    startSearching,
    skipPartner,
  };
}
