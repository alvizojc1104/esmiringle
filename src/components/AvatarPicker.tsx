"use client";

import React from "react";

export interface AvatarOption {
  id: string;
  name: string;
  gradient: string;
  emoji: string;
  accent: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "cyber_cat", name: "Cyber Cat", gradient: "from-purple-500 to-indigo-600", emoji: "🐱", accent: "#a855f7" },
  { id: "neon_fox", name: "Neon Fox", gradient: "from-amber-500 to-red-600", emoji: "🦊", accent: "#f97316" },
  { id: "astral_wanderer", name: "Astral Walker", gradient: "from-blue-600 to-cyan-400", emoji: "🚀", accent: "#06b6d4" },
  { id: "velvet_rose", name: "Velvet Rose", gradient: "from-pink-500 to-rose-600", emoji: "🌸", accent: "#ec4899" },
  { id: "pixel_bot", name: "Pixel Bot", gradient: "from-emerald-400 to-teal-700", emoji: "🤖", accent: "#10b981" },
  { id: "shadow_phantom", name: "Phantom", gradient: "from-slate-700 to-zinc-900", emoji: "👻", accent: "#94a3b8" },
  { id: "sunset_soul", name: "Sunset Soul", gradient: "from-orange-400 to-purple-600", emoji: "🌅", accent: "#f43f5e" },
  { id: "electric_spark", name: "Electric Spark", gradient: "from-yellow-400 to-amber-600", emoji: "⚡", accent: "#eab308" },
  { id: "mint_mystic", name: "Mint Mystic", gradient: "from-teal-400 to-emerald-600", emoji: "🌿", accent: "#2dd4bf" },
  { id: "cosmic_owl", name: "Cosmic Owl", gradient: "from-violet-600 to-fuchsia-600", emoji: "🦉", accent: "#c084fc" },
  { id: "hyper_tiger", name: "Hyper Tiger", gradient: "from-red-500 to-orange-500", emoji: "🐯", accent: "#ef4444" },
  { id: "starlight_muse", name: "Star Muse", gradient: "from-sky-400 to-indigo-500", emoji: "✨", accent: "#38bdf8" },
];

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AvatarDisplay({ avatarId, size = "md", className = "" }: { avatarId: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];

  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
    xl: "w-20 h-20 text-4xl shadow-xl",
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.gradient} ${sizeClasses} shadow-md border border-white/20 select-none transition-transform hover:scale-105 ${className}`}
      title={avatar.name}
    >
      <span className="drop-shadow-sm">{avatar.emoji}</span>
      <span
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
        style={{ backgroundColor: avatar.accent }}
      />
    </div>
  );
}

export default function AvatarPicker({ selectedId, onSelect }: AvatarPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Choose Your Persona Avatar
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-44 overflow-y-auto p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 scrollbar-thin">
        {AVATAR_OPTIONS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border ${
                isSelected
                  ? "bg-indigo-950/70 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105"
                  : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl shadow-sm`}
              >
                <span>{item.emoji}</span>
              </div>
              <span className="mt-1 text-[10px] font-medium text-slate-300 truncate w-full text-center">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
