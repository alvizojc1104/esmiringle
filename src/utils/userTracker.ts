export type DeviceType = "mobile" | "tablet" | "desktop" | "bot";

export interface ParsedUA {
  browser: string;
  os: string;
  deviceType: DeviceType;
}

export type UserStatus = "idle" | "in_queue" | "in_chat";

export interface ActiveUserSession {
  deviceId: string;
  socketId: string;
  deviceSnippet: string;
  status: UserStatus;
  connectedAt: number;
  lastActivityAt: number;
  userAgent: string;
  deviceType: DeviceType;
  os: string;
  browser: string;
  gender?: string;
}

export type ActivityType =
  | "connected"
  | "joined-queue"
  | "matched"
  | "left-queue"
  | "skipped"
  | "disconnected";

export interface ActivityEvent {
  id: string;
  timestamp: number;
  type: ActivityType;
  deviceId: string;
  deviceSnippet: string;
  deviceType: DeviceType;
  os: string;
  browser: string;
  userAgent: string;
  details: string;
}

export interface DashboardStats {
  onlineCount: number;
  queueCount: number;
  activeRoomsCount: number;
  inChatCount: number;
  totalUniqueDevices: number;
  serverUptimeSeconds: number;
  serverStartTime: number;
  breakdown: {
    deviceTypes: Record<string, number>;
    os: Record<string, number>;
    browsers: Record<string, number>;
  };
  activeUsers: ActiveUserSession[];
  recentActivities: ActivityEvent[];
}

export function parseUserAgent(uaString: string | undefined): ParsedUA {
  if (!uaString) {
    return { browser: "Unknown", os: "Unknown", deviceType: "desktop" };
  }

  const ua = uaString.toLowerCase();

  // Device type detection
  let deviceType: DeviceType = "desktop";
  if (/bot|crawler|spider|crawling|headless/i.test(ua)) {
    deviceType = "bot";
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = "mobile";
  }

  // OS detection
  let os = "Other";
  if (/windows phone/i.test(ua)) os = "Windows Phone";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Browser detection
  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua)) browser = "IE";

  return { browser, os, deviceType };
}
