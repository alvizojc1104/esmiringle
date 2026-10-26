"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Users,
  Radio,
  MessageSquare,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Bot,
  RefreshCw,
  Search,
  ArrowLeft,
  ShieldCheck,
  Globe,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DashboardStats,
  ActiveUserSession,
  ActivityEvent,
  DeviceType,
} from "../../utils/userTracker";

const STORAGE_KEY = "esmeringle_dash_token";

export default function DashboardPage() {
  const [token, setToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"activities" | "sessions">("activities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedUA, setExpandedUA] = useState<Record<string, boolean>>({});
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchStats = useCallback(
    async (authToken: string, isSilent = false): Promise<boolean> => {
      if (!isSilent) setLoading(true);
      try {
        const res = await fetch("/api/dashboard/stats", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "x-dashboard-key": authToken,
          },
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem(STORAGE_KEY);
          setError("Session expired or invalid password. Please unlock again.");
          return false;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch stats: HTTP ${res.status}`);
        }

        const data: DashboardStats = await res.json();
        setStats(data);
        setError(null);
        setLastRefreshedAt(new Date());
        setIsAuthenticated(true);
        return true;
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Failed to load dashboard metrics");
        return false;
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    []
  );

  // Check saved token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
      fetchStats(savedToken, false);
    }
  }, [fetchStats]);

  // Handle periodic auto-refresh if authenticated
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !token) return;
    const interval = setInterval(() => {
      fetchStats(token, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, token, fetchStats]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsVerifying(true);
    setAuthError(null);

    const success = await fetchStats(passwordInput.trim(), false);
    setIsVerifying(false);

    if (success) {
      setToken(passwordInput.trim());
      sessionStorage.setItem(STORAGE_KEY, passwordInput.trim());
      setPasswordInput("");
      setAuthError(null);
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken("");
    setIsAuthenticated(false);
    setStats(null);
  };

  const toggleExpandUA = (id: string) => {
    setExpandedUA((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5" />;
      case "bot":
        return <Bot className="w-3.5 h-3.5" />;
      default:
        return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  const getActivityBadge = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "connected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        );
      case "joined-queue":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Queue
          </span>
        );
      case "matched":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Matched
          </span>
        );
      case "left-queue":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Left Queue
          </span>
        );
      case "skipped":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            Skipped
          </span>
        );
      case "disconnected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Disconnected
          </span>
        );
      default:
        return null;
    }
  };

  const filteredActivities = useMemo(() => {
    if (!stats?.recentActivities) return [];
    if (!searchQuery.trim()) return stats.recentActivities;
    const q = searchQuery.toLowerCase();
    return stats.recentActivities.filter(
      (a) =>
        a.type.toLowerCase().includes(q) ||
        a.details.toLowerCase().includes(q) ||
        a.browser.toLowerCase().includes(q) ||
        a.os.toLowerCase().includes(q) ||
        a.deviceType.toLowerCase().includes(q) ||
        a.userAgent.toLowerCase().includes(q) ||
        a.deviceSnippet.toLowerCase().includes(q)
    );
  }, [stats?.recentActivities, searchQuery]);

  const filteredSessions = useMemo(() => {
    if (!stats?.activeUsers) return [];
    if (!searchQuery.trim()) return stats.activeUsers;
    const q = searchQuery.toLowerCase();
    return stats.activeUsers.filter(
      (u) =>
        u.status.toLowerCase().includes(q) ||
        u.browser.toLowerCase().includes(q) ||
        u.os.toLowerCase().includes(q) ||
        u.deviceType.toLowerCase().includes(q) ||
        u.userAgent.toLowerCase().includes(q) ||
        u.deviceSnippet.toLowerCase().includes(q)
    );
  }, [stats?.activeUsers, searchQuery]);

  // Lock Screen Render if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Dashboard Protected
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Enter your admin password to view live in-memory telemetry, user-agent analytics, and active chat queues.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (e.g. 125090)"
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !passwordInput.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to esmiringle Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Return to home page"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                esm
              </span>
              <div>
                <h1 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                  <span>esmiringle Live Dashboard</span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In-Memory
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Render.com runtime telemetry & User-Agent analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                autoRefresh
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? "bg-blue-500 animate-ping" : "bg-slate-400"
                }`}
              />
              <span className="hidden sm:inline">Auto-refresh (3s)</span>
              <span className="sm:hidden">Auto</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchStats(token, false)}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 shadow-xs"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Lock / Logout Button */}
            <button
              onClick={handleLock}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
              title="Lock dashboard"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchStats(token, false)}
              className="underline font-semibold ml-2 hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Online Users */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Online Users</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.onlineCount ?? 0}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Live connected sockets</p>
          </div>

          {/* In Queue */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">In Match Queue</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.queueCount ?? 0}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Waiting
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Strangers searching</p>
          </div>

          {/* Active Chats */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">In Active Chat</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.inChatCount ?? 0}
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                {stats?.activeRoomsCount ?? 0} {stats?.activeRoomsCount === 1 ? "room" : "rooms"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Paired strangers</p>
          </div>

          {/* Unique Devices */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Unique Visitors</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.totalUniqueDevices ?? 0}
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Total
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Since service start</p>
          </div>

          {/* Server Uptime */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Server Uptime</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats ? formatUptime(stats.serverUptimeSeconds) : "0s"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Started {stats ? new Date(stats.serverStartTime).toLocaleTimeString() : "--"}
            </p>
          </div>
        </div>

        {/* User-Agent Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Device Types */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>Device Distribution</span>
            </h2>
            <div className="space-y-2.5">
              {stats?.breakdown?.deviceTypes &&
                Object.entries(stats.breakdown.deviceTypes).map(([type, count]) => {
                  const total = stats.onlineCount || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="capitalize flex items-center gap-1.5">
                          {getDeviceIcon(type as DeviceType)}
                          {type}
                        </span>
                        <span>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {(!stats?.breakdown?.deviceTypes ||
                Object.values(stats.breakdown.deviceTypes).every((v) => v === 0)) && (
                <p className="text-xs text-slate-400 italic">No active devices connected</p>
              )}
            </div>
          </div>

          {/* Operating Systems */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-500" />
              <span>Operating Systems</span>
            </h2>
            <div className="space-y-2.5">
              {stats?.breakdown?.os &&
                Object.entries(stats.breakdown.os).map(([osName, count]) => {
                  const total = stats.onlineCount || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={osName} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{osName}</span>
                        <span>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {(!stats?.breakdown?.os || Object.keys(stats.breakdown.os).length === 0) && (
                <p className="text-xs text-slate-400 italic">No OS data captured yet</p>
              )}
            </div>
          </div>

          {/* Browsers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-500" />
              <span>Browser Breakdown</span>
            </h2>
            <div className="space-y-2.5">
              {stats?.breakdown?.browsers &&
                Object.entries(stats.breakdown.browsers).map(([browser, count]) => {
                  const total = stats.onlineCount || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={browser} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{browser}</span>
                        <span>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {(!stats?.breakdown?.browsers || Object.keys(stats.breakdown.browsers).length === 0) && (
                <p className="text-xs text-slate-400 italic">No browser data captured yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200 dark:bg-slate-800/80">
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "activities"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Activity Feed ({stats?.recentActivities?.length ?? 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "sessions"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Sessions ({stats?.activeUsers?.length ?? 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by browser, OS, device, event..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Tab 1: Live Activity Feed */}
        {activeTab === "activities" && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Recent Activity Stream (In-Memory Buffer)</span>
              <span>Updated {lastRefreshedAt.toLocaleTimeString()}</span>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No recent activity recorded yet. As users connect, match, and chat, events will stream here!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredActivities.map((act) => {
                  const isExpanded = !!expandedUA[act.id];
                  return (
                    <div
                      key={act.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        {getActivityBadge(act.type)}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {act.details}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              {getDeviceIcon(act.deviceType)}
                              <span className="capitalize">{act.deviceType}</span>
                            </span>
                            <span>•</span>
                            <span>{act.os}</span>
                            <span>•</span>
                            <span>{act.browser}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {act.deviceSnippet}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                        <button
                          onClick={() => toggleExpandUA(act.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Toggle User-Agent string"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Raw User-Agent */}
                      {isExpanded && (
                        <div className="w-full mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all select-all">
                          <span className="text-slate-400 font-bold block mb-0.5">
                            RAW USER-AGENT:
                          </span>
                          {act.userAgent}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Active User Sessions */}
        {activeTab === "sessions" && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Connected Devices & State ({filteredSessions.length})</span>
              <span>In-Memory Registry</span>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No active user sessions currently connected.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Device / Status</th>
                      <th className="px-4 py-3">Device Type</th>
                      <th className="px-4 py-3">OS</th>
                      <th className="px-4 py-3">Browser</th>
                      <th className="px-4 py-3">Connected</th>
                      <th className="px-4 py-3">User-Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredSessions.map((u) => {
                      const isExpanded = !!expandedUA[u.socketId];
                      return (
                        <React.Fragment key={u.socketId}>
                          <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    u.status === "in_chat"
                                      ? "bg-purple-500"
                                      : u.status === "in_queue"
                                      ? "bg-amber-500 animate-pulse"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                <div>
                                  <span className="font-mono text-slate-900 dark:text-slate-100">
                                    {u.deviceSnippet}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 capitalize">
                                    {u.status.replace("_", " ")}
                                    {u.gender ? ` • ${u.gender}` : ""}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              <span className="inline-flex items-center gap-1.5 capitalize">
                                {getDeviceIcon(u.deviceType)}
                                {u.deviceType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                              {u.os}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {u.browser}
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatTimeAgo(u.connectedAt)}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              <button
                                onClick={() => toggleExpandUA(u.socketId)}
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>{isExpanded ? "Hide UA" : "View UA"}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50 dark:bg-slate-950/60">
                              <td colSpan={6} className="px-4 py-2.5">
                                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all select-all">
                                  {u.userAgent}
                                </p>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
