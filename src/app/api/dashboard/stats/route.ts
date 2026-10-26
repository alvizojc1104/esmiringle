import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const expectedPassword =
    process.env.DASHBOARD_PASSWORD || process.env.ADMIN_PASSWORD || "125090";
  const url = new URL(req.url);
  const providedKey =
    req.headers.get("x-dashboard-key") || url.searchParams.get("key");

  if (providedKey !== expectedPassword) {
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
