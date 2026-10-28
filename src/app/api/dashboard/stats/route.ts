import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function safeComparePassword(provided: string | null | undefined, expected: string): boolean {
  if (!provided || typeof provided !== "string") return false;
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);
  if (bufProvided.length !== bufExpected.length) {
    crypto.timingSafeEqual(bufExpected, bufExpected);
    return false;
  }
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function GET(req: Request) {
  const expectedPassword =
    process.env.DASHBOARD_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      {
        error:
          "Dashboard authentication is not configured on the server. Please set DASHBOARD_PASSWORD in your environment variables.",
      },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const providedKey =
    req.headers.get("x-dashboard-key") || url.searchParams.get("key");

  if (!safeComparePassword(providedKey, expectedPassword)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid password" },
      { status: 401 }
    );
  }

  if (typeof (globalThis as any).__getDashboardStats === "function") {
    const stats = (globalThis as any).__getDashboardStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // Fallback if accessed outside custom server runner
  return NextResponse.json(
    {
      onlineCount: 0,
      queueCount: 0,
      activeRoomsCount: 0,
      inChatCount: 0,
      totalUniqueDevices: 0,
      serverUptimeSeconds: 0,
      serverStartTime: Date.now(),
      breakdown: {
        deviceTypes: { mobile: 0, desktop: 0, tablet: 0, bot: 0 },
        os: {},
        browsers: {},
      },
      activeUsers: [],
      recentActivities: [],
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
