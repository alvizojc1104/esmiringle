import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-50 select-none">
      <div className="relative flex items-center justify-center">
        {/* Subtle glowing pulse */}
        <div className="absolute w-20 h-20 rounded-2xl bg-blue-500/15 dark:bg-blue-400/15 animate-ping opacity-75" />

        {/* Official app logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/android-chrome-192x192.png"
          alt="esmeringle loading"
          className="relative w-16 h-16 rounded-2xl object-contain shadow-md animate-pulse"
        />
      </div>
    </div>
  );
}
