import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { UserProfile, QueueEntry } from "./src/types/chat";

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
  });

  const waitingQueue: QueueEntry[] = [];
  const activeRooms = new Map<string, ActiveRoom>();
  const userProfiles = new Map<string, UserProfile>();

  const broadcastOnlineCount = () => {
    io.emit("online-count", io.engine.clientsCount);
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

      console.log(`[MATCH] Room ${roomId} matched (${currentEntry.profile.gender} & ${candidate.profile.gender})`);
      return true;
    }

    return false;
  };

  io.on("connection", (socket: Socket) => {
    broadcastOnlineCount();

    socket.on("join-queue", (profile: UserProfile) => {
      userProfiles.set(socket.id, profile);

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
        profile,
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

    socket.on("send-message", (data: { text: string }) => {
      const room = activeRooms.get(socket.id);
      if (!room || !data.text || !data.text.trim()) return;

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderId: socket.id,
        senderType: "stranger",
        text: data.text.trim().slice(0, 1000),
        timestamp: Date.now(),
      };

      socket.to(room.partnerSocketId).emit("partner-message", message);
      socket.emit("message-sent", {
        ...message,
        senderType: "you",
      });
    });

    socket.on("typing", (isTyping: boolean) => {
      const room = activeRooms.get(socket.id);
      if (room) {
        socket.to(room.partnerSocketId).emit("partner-typing", isTyping);
      }
    });

    socket.on("skip-partner", () => {
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
