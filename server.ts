import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { UserProfile, QueueEntry } from "./src/types/chat";
import {
  SlidingWindowRateLimiter,
  TemporaryBlocklist,
  getClientIp,
} from "./src/server/rateLimiter";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3005", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface ActiveRoom {
  roomId: string;
  partnerSocketId: string;
  partnerProfile: UserProfile;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Lightweight keep-alive & health check endpoints for external cron-jobs (e.g. cron-job.org)
      // Returns immediate HTTP 200 without touching Socket.IO, Next.js SSR, or online user counts
      const parsedUrl = req.url?.split("?")[0];
      if (parsedUrl === "/health" || parsedUrl === "/api/health" || parsedUrl === "/ping") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.statusCode = 200;
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        res.end(
          JSON.stringify({
            status: "ok",
            timestamp: Date.now(),
            service: "esmeringle",
          })
        );
        return;
      }

      await handle(req, res);
    } catch (err) {
      console.error("Error handling request", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    // Max payload size to protect against memory exhaustion
    maxHttpBufferSize: 1e6, // 1MB
    // Reduced ping timeout & interval so dead mobile connections are evicted quickly
    pingTimeout: 10000,
    pingInterval: 5000,
  });

  // Anti-DDoS Rate Limiters
  const messageLimiter = new SlidingWindowRateLimiter({ windowMs: 3000, maxRequests: 5 });
  const skipLimiter = new SlidingWindowRateLimiter({ windowMs: 4000, maxRequests: 4 });
  const typingLimiter = new SlidingWindowRateLimiter({ windowMs: 1000, maxRequests: 3 });
  const connectionLimiter = new SlidingWindowRateLimiter({ windowMs: 60000, maxRequests: 30 });
  const temporaryBlocklist = new TemporaryBlocklist();
  const activeSessions = new Map<string, Set<string>>();
  const activeSocketsPerIp = new Map<string, Set<string>>();

  // Connection-level anti-DDoS middleware
  io.use((socket, next) => {
    const clientIp = getClientIp(socket);

    if (temporaryBlocklist.isBlocked(clientIp)) {
      console.warn(`[RATE LIMIT] Rejected connection from temporarily blocked IP: ${clientIp}`);
      return next(new Error("Temporarily blocked due to rate limit abuse. Try again later."));
    }

    const connCheck = connectionLimiter.check(clientIp);
    if (!connCheck.allowed) {
      console.warn(`[RATE LIMIT] Connection flood detected from IP: ${clientIp}. Blocking for 60s.`);
      temporaryBlocklist.block(clientIp, 60000);
      return next(new Error("Too many connection attempts. Please slow down."));
    }

    const currentConns = activeSocketsPerIp.get(clientIp)?.size || 0;
    if (currentConns >= 8) {
      console.warn(`[RATE LIMIT] Max concurrent connections exceeded for IP: ${clientIp} (${currentConns})`);
      return next(new Error("Too many concurrent chat sessions from this IP."));
    }

    next();
  });

  const waitingQueue: QueueEntry[] = [];
  const activeRooms = new Map<string, ActiveRoom>();
  const userProfiles = new Map<string, UserProfile>();

  const broadcastOnlineCount = () => {
    const count = activeSessions.size > 0 ? activeSessions.size : io.sockets.sockets.size;
    io.emit("online-count", count);
  };

  const tryMatchUser = (currentEntry: QueueEntry): boolean => {
    // Find candidate in queue
    let candidateIndex = -1;

    for (let i = 0; i < waitingQueue.length; i++) {
      if (waitingQueue[i].socketId !== currentEntry.socketId) {
        candidateIndex = i;
        break;
      }
    }

    if (candidateIndex !== -1) {
      const [candidate] = waitingQueue.splice(candidateIndex, 1);

      // Clean current entry from queue if present
      const curIdx = waitingQueue.findIndex((q) => q.socketId === currentEntry.socketId);
      if (curIdx !== -1) {
        waitingQueue.splice(curIdx, 1);
      }

      const socketA = io.sockets.sockets.get(currentEntry.socketId);
      const socketB = io.sockets.sockets.get(candidate.socketId);

      if (!socketA || !socketB) {
        if (socketA) waitingQueue.unshift(currentEntry);
        if (socketB) waitingQueue.unshift(candidate);
        return false;
      }

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      socketA.join(roomId);
      socketB.join(roomId);

      activeRooms.set(socketA.id, {
        roomId,
        partnerSocketId: socketB.id,
        partnerProfile: candidate.profile,
      });

      activeRooms.set(socketB.id, {
        roomId,
        partnerSocketId: socketA.id,
        partnerProfile: currentEntry.profile,
      });

      socketA.emit("matched", {
        id: candidate.profile.id,
        gender: candidate.profile.gender,
        roomId,
      });

      socketB.emit("matched", {
        id: currentEntry.profile.id,
        gender: currentEntry.profile.gender,
        roomId,
      });

      console.log(`[MATCH] Room ${roomId} matched`);
      return true;
    }

    return false;
  };

  io.on("connection", (socket: Socket) => {
    const deviceId =
      (socket.handshake.auth?.deviceId as string) ||
      (socket.handshake.auth?.sessionId as string) ||
      socket.id;

    // Immediately terminate any stale ghost sockets from the same device
    const existingSockets = activeSessions.get(deviceId);
    if (existingSockets && existingSockets.size > 0) {
      existingSockets.forEach((staleSocketId) => {
        if (staleSocketId !== socket.id) {
          const staleSocket = io.sockets.sockets.get(staleSocketId);
          if (staleSocket) {
            console.log(`[DEVICE] Purging stale socket ${staleSocketId} for device ${deviceId}`);
            staleSocket.disconnect(true);
          }
        }
      });
    }

    let sSockets = activeSessions.get(deviceId);
    if (!sSockets) {
      sSockets = new Set();
      activeSessions.set(deviceId, sSockets);
    }
    sSockets.add(socket.id);

    const clientIp = getClientIp(socket);
    let ipSet = activeSocketsPerIp.get(clientIp);
    if (!ipSet) {
      ipSet = new Set();
      activeSocketsPerIp.set(clientIp, ipSet);
    }
    ipSet.add(socket.id);

    broadcastOnlineCount();

    socket.on("join-queue", (profile?: UserProfile) => {
      const userProfile: UserProfile =
        profile && typeof profile.id === "string" && typeof profile.gender === "string"
          ? { id: profile.id.slice(0, 100), gender: profile.gender }
          : { id: socket.id, gender: "undisclosed" };
      userProfiles.set(socket.id, userProfile);

      // Clean up previous queue entries
      const existingIdx = waitingQueue.findIndex((q) => q.socketId === socket.id);
      if (existingIdx !== -1) {
        waitingQueue.splice(existingIdx, 1);
      }

      // Clean up previous room if any
      const existingRoom = activeRooms.get(socket.id);
      if (existingRoom) {
        const partnerSocket = io.sockets.sockets.get(existingRoom.partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit("partner-left", { reason: "skipped" });
          activeRooms.delete(existingRoom.partnerSocketId);
        }
        activeRooms.delete(socket.id);
      }

      const queueEntry: QueueEntry = {
        socketId: socket.id,
        profile: userProfile,
        joinedAt: Date.now(),
      };

      const matched = tryMatchUser(queueEntry);
      if (!matched) {
        waitingQueue.push(queueEntry);
        socket.emit("queue-status", { status: "waiting" });
      }
    });

    socket.on("leave-queue", () => {
      const idx = waitingQueue.findIndex((q) => q.socketId === socket.id);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
      }
      socket.emit("queue-status", { status: "idle" });
    });

    socket.on("check-match", (callback?: (res: { active: boolean }) => void) => {
      const room = activeRooms.get(socket.id);
      if (typeof callback === "function") {
        callback({ active: !!room });
      }
    });

    socket.on("send-message", (data: { text: string }) => {
      const room = activeRooms.get(socket.id);
      if (!room) {
        socket.emit("partner-left", { reason: "disconnected" });
        return;
      }
      if (!data || typeof data.text !== "string" || !data.text.trim()) return;

      // Rate limit check
      const clientIp = getClientIp(socket);
      const socketCheck = messageLimiter.check(socket.id);
      const ipCheck = messageLimiter.check(`msg_ip_${clientIp}`);

      if (!socketCheck.allowed || !ipCheck.allowed) {
        // Severe flood detection (more than 12 rapid messages in window)
        if (socketCheck.currentCount > 12) {
          console.warn(`[DDOS SHIELD] Abusive message flood from ${clientIp} (socket: ${socket.id}). Banning for 60s.`);
          temporaryBlocklist.block(clientIp, 60000);
          socket.emit("rate-limited", {
            message: "Excessive message flooding detected. You have been temporarily blocked.",
            retryAfterMs: 60000,
          });
          socket.disconnect(true);
          return;
        }

        socket.emit("rate-limited", {
          message: "You are sending messages too fast! Please slow down.",
          retryAfterMs: Math.max(socketCheck.retryAfterMs, ipCheck.retryAfterMs),
        });
        return;
      }

      // Max message length guard
      const sanitizedText = data.text.trim().slice(0, 1000);

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderId: socket.id,
        senderType: "stranger",
        text: sanitizedText,
        timestamp: Date.now(),
      };

      socket.to(room.partnerSocketId).emit("partner-message", message);
      socket.emit("message-sent", {
        ...message,
        senderType: "you",
      });
    });

    socket.on("typing", (isTyping: boolean) => {
      const typingCheck = typingLimiter.check(socket.id);
      if (!typingCheck.allowed) return;

      const room = activeRooms.get(socket.id);
      if (room) {
        socket.to(room.partnerSocketId).emit("partner-typing", isTyping);
      }
    });

    socket.on("skip-partner", () => {
      const skipCheck = skipLimiter.check(socket.id);
      if (!skipCheck.allowed) {
        socket.emit("rate-limited", {
          message: "You are skipping too fast! Please wait a moment.",
          retryAfterMs: skipCheck.retryAfterMs,
        });
        return;
      }

      const room = activeRooms.get(socket.id);
      if (room) {
        const partnerSocket = io.sockets.sockets.get(room.partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit("partner-left", { reason: "skipped" });
          activeRooms.delete(room.partnerSocketId);
        }
        activeRooms.delete(socket.id);
      }
    });

    socket.on("report-partner", (reason: string) => {
      const room = activeRooms.get(socket.id);
      if (room) {
        const partnerSocket = io.sockets.sockets.get(room.partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit("partner-left", { reason: "reported" });
          activeRooms.delete(room.partnerSocketId);
        }
        activeRooms.delete(socket.id);
      }
    });

    socket.on("disconnect", () => {
      const deviceId =
        (socket.handshake.auth?.deviceId as string) ||
        (socket.handshake.auth?.sessionId as string) ||
        socket.id;
      const sSockets = activeSessions.get(deviceId);
      if (sSockets) {
        sSockets.delete(socket.id);
        if (sSockets.size === 0) {
          activeSessions.delete(deviceId);
        }
      }

      const clientIp = getClientIp(socket);
      const ipSet = activeSocketsPerIp.get(clientIp);
      if (ipSet) {
        ipSet.delete(socket.id);
        if (ipSet.size === 0) {
          activeSocketsPerIp.delete(clientIp);
        }
      }

      messageLimiter.reset(socket.id);
      skipLimiter.reset(socket.id);
      typingLimiter.reset(socket.id);

      const qIdx = waitingQueue.findIndex((q) => q.socketId === socket.id);
      if (qIdx !== -1) {
        waitingQueue.splice(qIdx, 1);
      }

      const room = activeRooms.get(socket.id);
      if (room) {
        const partnerSocket = io.sockets.sockets.get(room.partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit("partner-left", { reason: "disconnected" });
          activeRooms.delete(room.partnerSocketId);
        }
        activeRooms.delete(socket.id);
      }

      userProfiles.delete(socket.id);
      broadcastOnlineCount();
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
