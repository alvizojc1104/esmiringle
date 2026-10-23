import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Not Found",
  description: "Hoy, walay nag esmiringhoy diri (No esmiringhoy found here)",
};

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">
      <div className="flex flex-col items-center text-center max-w-md w-full">
        {/* App Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-3xl bg-blue-500/10 dark:bg-blue-400/10 blur-xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/android-chrome-192x192.png"
            alt="esmiringle icon"
            className="relative w-20 h-20 rounded-2xl object-contain shadow-lg border border-slate-200/80 dark:border-slate-800"
          />
        </div>

        {/* 404 Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 mb-3">
          404 &bull; Not Found
        </span>

        {/* Custom Text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          hoy, walay nag esmiringhoy diri
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
          no esmiringhoy found here
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Balik sa Home / Go Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
