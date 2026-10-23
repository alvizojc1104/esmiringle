import { Socket } from "socket.io";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class SlidingWindowRateLimiter {
  private records = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;

    // Prune stale entries every 60 seconds
    const timer = setInterval(() => this.prune(), 60000);
    if (timer.unref) {
      timer.unref();
    }
  }

  public check(key: string): { allowed: boolean; remaining: number; retryAfterMs: number; currentCount: number } {
    const now = Date.now();
    const timestamps = this.records.get(key) || [];
    const validTimestamps = timestamps.filter((t: number) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const retryAfterMs = Math.max(0, this.windowMs - (now - oldest));
      this.records.set(key, validTimestamps);
      return { allowed: false, remaining: 0, retryAfterMs, currentCount: validTimestamps.length };
    }

    validTimestamps.push(now);
    this.records.set(key, validTimestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      retryAfterMs: 0,
      currentCount: validTimestamps.length,
    };
  }

  public reset(key: string) {
    this.records.delete(key);
  }

  private prune() {
    const now = Date.now();
    this.records.forEach((timestamps: number[], key: string) => {
      const valid = timestamps.filter((t: number) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.records.delete(key);
      } else {
        this.records.set(key, valid);
      }
    });
  }
}

export class TemporaryBlocklist {
  private blockedIps = new Map<string, number>();

  public isBlocked(ip: string): boolean {
    const expiresAt = this.blockedIps.get(ip);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
      this.blockedIps.delete(ip);
      return false;
    }
    return true;
  }

  public block(ip: string, durationMs: number = 60000) {
    this.blockedIps.set(ip, Date.now() + durationMs);
  }
}

export function getClientIp(socket: Socket): string {
  const cfIp = socket.handshake.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp.trim()) {
    return cfIp.trim();
  }
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return socket.handshake.address || "127.0.0.1";
}
