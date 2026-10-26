"use client";

import { useRef, useCallback } from "react";
import { UserProfile } from "../types/chat";
import { useSocket } from "../context/SocketContext";

function isValidProfile(p: unknown): p is UserProfile {
  return (
    !!p &&
    typeof p === "object" &&
    "id" in p &&
    typeof (p as any).id === "string" &&
    "gender" in p &&
    typeof (p as any).gender === "string"
  );
}

export function useChatSocket(profile: UserProfile | null) {
  const context = useSocket();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Extract stable action functions directly from context
  const contextStartSearching = context.startSearching;
  const contextSkipPartner = context.skipPartner;

  // Wrap with memoized callbacks that are completely stable across re-renders
  const startSearching = useCallback(
    (overrideProfile?: unknown) => {
      const p = isValidProfile(overrideProfile) ? overrideProfile : profileRef.current;
      contextStartSearching(p);
    },
    [contextStartSearching]
  );

  const skipPartner = useCallback(
    (overrideProfile?: unknown) => {
      const p = isValidProfile(overrideProfile) ? overrideProfile : profileRef.current;
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
