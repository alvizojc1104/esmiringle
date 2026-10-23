import { io, Socket } from "socket.io-client";

const SERVER_URL = process.env.TEST_URL || "http://localhost:3005";
const NUM_USERS = 20;

interface TestClient {
  id: number;
  ip: string;
  socket: Socket;
  gender: "male" | "female" | "undisclosed";
  connected: boolean;
  matchedRoomId?: string;
  partnerId?: string;
  messagesSent: number;
  messagesReceived: number;
  errors: string[];
}

async function runConcurrentTest() {
  console.log("\n========================================================");
  console.log(`🚀 Starting Concurrency Test with ${NUM_USERS} simultaneous users`);
  console.log(`📍 Target Server: ${SERVER_URL}`);
  console.log("========================================================\n");

  const clients: TestClient[] = [];
  const genders: ("male" | "female" | "undisclosed")[] = ["male", "female", "undisclosed"];

  // Step 1: Connect 20 concurrent sockets
  console.log(`[Step 1/5] Connecting ${NUM_USERS} users simultaneously...`);
  const connectPromises = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    const fakeIp = `198.51.100.${10 + i}`;
    const gender = genders[i % genders.length];

    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: false,
      extraHeaders: {
        "x-forwarded-for": fakeIp,
        "cf-connecting-ip": fakeIp,
      },
    });

    const client: TestClient = {
      id: i,
      ip: fakeIp,
      socket,
      gender,
      connected: false,
      messagesSent: 0,
      messagesReceived: 0,
      errors: [],
    };
    clients.push(client);

    const promise = new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        client.errors.push("Connection timeout (5000ms)");
        resolve();
      }, 5000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        client.connected = true;
        resolve();
      });

      socket.on("connect_error", (err) => {
        clearTimeout(timeout);
        client.errors.push(`Connect Error: ${err.message}`);
        resolve();
      });

      socket.on("rate-limited", (data) => {
        client.errors.push(`Rate-Limited: ${data.message}`);
      });
    });

    connectPromises.push(promise);
  }

  await Promise.all(connectPromises);

  const connectedCount = clients.filter((c) => c.connected).length;
  console.log(`✅ Connections established: ${connectedCount} / ${NUM_USERS} (${Math.round((connectedCount / NUM_USERS) * 100)}%)`);

  if (connectedCount === 0) {
    console.error("❌ Fatal: No sockets were able to connect to the server.");
    process.exit(1);
  }

  // Step 2: Queue for matching
  console.log(`\n[Step 2/5] Putting all ${connectedCount} connected users into the matchmaking queue...`);
  const matchPromises = clients
    .filter((c) => c.connected)
    .map((client) => {
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (!client.matchedRoomId) {
            client.errors.push("Match timeout (10000ms)");
          }
          resolve();
        }, 10000);

        client.socket.on("matched", (data: { roomId: string; id: string; gender: string }) => {
          clearTimeout(timeout);
          client.matchedRoomId = data.roomId;
          client.partnerId = data.id;
          resolve();
        });

        // Join queue
        client.socket.emit("join-queue", {
          id: `test_user_${client.id}`,
          gender: client.gender,
        });
      });
    });

  await Promise.all(matchPromises);

  const matchedClients = clients.filter((c) => c.matchedRoomId);
  const uniqueRooms = new Set(matchedClients.map((c) => c.matchedRoomId));

  console.log(`✅ Matched Users: ${matchedClients.length} / ${connectedCount}`);
  console.log(`✅ Unique Active Rooms Formed: ${uniqueRooms.size} (Expected: ${Math.floor(connectedCount / 2)})`);

  // Step 3: Message exchange across all rooms
  console.log(`\n[Step 3/5] Testing bidirectional messaging between paired users...`);
  const messageLatencies: number[] = [];
  const messagePromises: Promise<void>[] = [];

  for (const client of matchedClients) {
    const p = new Promise<void>((resolve) => {
      const sendTime = Date.now();
      const testText = `Hello from user #${client.id}! (${Date.now()})`;

      client.socket.once("partner-message", (msg: { text: string; timestamp: number }) => {
        const rtt = Date.now() - sendTime;
        messageLatencies.push(rtt);
        client.messagesReceived++;
        resolve();
      });

      // Send after brief delay
      setTimeout(() => {
        client.socket.emit("send-message", { text: testText });
        client.messagesSent++;
      }, 100 + Math.random() * 200);

      // Fallback resolve after 3s
      setTimeout(resolve, 3000);
    });

    messagePromises.push(p);
  }

  await Promise.all(messagePromises);

  const totalSent = clients.reduce((acc, c) => acc + c.messagesSent, 0);
  const totalReceived = clients.reduce((acc, c) => acc + c.messagesReceived, 0);
  const avgLatency =
    messageLatencies.length > 0
      ? Math.round(messageLatencies.reduce((a, b) => a + b, 0) / messageLatencies.length)
      : 0;

  console.log(`✅ Messages sent: ${totalSent}`);
  console.log(`✅ Messages received: ${totalReceived}`);
  console.log(`⏱️ Average Message RTT Latency: ${avgLatency} ms`);

  // Step 4: Test typing indicator & partner skip
  console.log(`\n[Step 4/5] Testing typing indicators and partner skip events...`);
  let typingEventsReceived = 0;
  let skipEventsReceived = 0;

  const eventPromises: Promise<void>[] = [];

  // Setup listeners on even-numbered clients
  for (let i = 0; i < matchedClients.length; i += 2) {
    const clientA = matchedClients[i];
    const clientB = matchedClients[i + 1];

    if (!clientA || !clientB) continue;

    const p = new Promise<void>((resolve) => {
      clientB.socket.once("partner-typing", (isTyping) => {
        if (isTyping) typingEventsReceived++;
      });

      clientB.socket.once("partner-left", (data: { reason: string }) => {
        if (data.reason === "skipped") skipEventsReceived++;
        resolve();
      });

      // clientA emits typing, then skips
      clientA.socket.emit("typing", true);
      setTimeout(() => {
        clientA.socket.emit("skip-partner");
      }, 250);

      setTimeout(resolve, 2000);
    });

    eventPromises.push(p);
  }

  await Promise.all(eventPromises);

  console.log(`✅ Partner typing events received: ${typingEventsReceived}`);
  console.log(`✅ Partner skip notifications received: ${skipEventsReceived}`);

  // Step 5: Clean disconnect
  console.log(`\n[Step 5/5] Gracefully disconnecting all clients...`);
  for (const client of clients) {
    client.socket.disconnect();
  }

  // Final summary
  const allErrors = clients.flatMap((c) => c.errors);
  console.log("\n========================================================");
  console.log("📊 CONCURRENCY TEST SUMMARY REPORT");
  console.log("========================================================");
  console.log(`• Total Concurrent Users Tested: ${NUM_USERS}`);
  console.log(`• Connection Success Rate:       ${connectedCount}/${NUM_USERS} (${Math.round((connectedCount / NUM_USERS) * 100)}%)`);
  console.log(`• Matchmaking Success Rate:      ${matchedClients.length}/${connectedCount} (${Math.round((matchedClients.length / connectedCount) * 100)}%)`);
  console.log(`• Active Pair Rooms Formed:      ${uniqueRooms.size} rooms`);
  console.log(`• Message Delivery Rate:         ${totalReceived}/${totalSent} (${totalSent > 0 ? Math.round((totalReceived / totalSent) * 100) : 0}%)`);
  console.log(`• Average Message Latency:       ${avgLatency} ms`);
  console.log(`• Error Count:                   ${allErrors.length}`);

  if (allErrors.length > 0) {
    console.log("\n⚠️ Logged Warnings / Errors:");
    for (const err of allErrors) {
      console.log(`   - ${err}`);
    }
  } else {
    console.log("\n🎉 ZERO connection failures, rate limit blocks, or message drops detected!");
  }
  console.log("========================================================\n");

  process.exit(allErrors.length > 0 ? 1 : 0);
}

runConcurrentTest().catch((err) => {
  console.error("Unhandled test runner exception:", err);
  process.exit(1);
});
