import { io } from "socket.io-client";
import { UserProfile } from "./src/types/chat";

async function runTest() {
  console.log("=== STARTING SIMPLIFIED MULTI-CLIENT MATCHMAKING TEST ===");

  const socketA = io("http://localhost:3005", { transports: ["websocket"] });
  const socketB = io("http://localhost:3005", { transports: ["websocket"] });

  const profileA: UserProfile = {
    id: "user_alice",
    gender: "female",
  };

  const profileB: UserProfile = {
    id: "user_bob",
    gender: "male",
  };

  await Promise.all([
    new Promise<void>((resolve) => socketA.on("connect", () => {
      console.log("✓ Socket A connected:", socketA.id);
      resolve();
    })),
    new Promise<void>((resolve) => socketB.on("connect", () => {
      console.log("✓ Socket B connected:", socketB.id);
      resolve();
    })),
  ]);

  // Test Matchmaking
  console.log("\n--- Testing Matchmaking Pairing ---");
  const matchPromiseA = new Promise<any>((resolve) => socketA.on("matched", resolve));
  const matchPromiseB = new Promise<any>((resolve) => socketB.on("matched", resolve));

  socketA.emit("join-queue", profileA);
  socketB.emit("join-queue", profileB);

  const [matchA, matchB] = await Promise.all([matchPromiseA, matchPromiseB]);
  console.log("✓ Socket A matched with gender:", matchA.gender, "roomId:", matchA.roomId);
  console.log("✓ Socket B matched with gender:", matchB.gender, "roomId:", matchB.roomId);

  if (matchA.roomId !== matchB.roomId) {
    throw new Error("Room IDs do not match!");
  }
  console.log("✓ Matchmaking & Room pairing verification passed!");

  // Test Live Messaging
  console.log("\n--- Testing Live Messaging ---");
  const messagePromiseB = new Promise<any>((resolve) => socketB.on("partner-message", resolve));
  socketA.emit("send-message", { text: "Hello! Testing simple chat." });

  const receivedMsg = await messagePromiseB;
  console.log("✓ Socket B received message from Stranger:", receivedMsg.text);
  if (receivedMsg.text !== "Hello! Testing simple chat.") {
    throw new Error("Message content mismatch!");
  }

  // Test Typing Indicator
  console.log("\n--- Testing Typing Indicator ---");
  const typingPromiseA = new Promise<boolean>((resolve) => socketA.on("partner-typing", resolve));
  socketB.emit("typing", true);
  const typingState = await typingPromiseA;
  console.log("✓ Socket A received partner-typing indicator:", typingState);

  // Test Skip / Disconnect
  console.log("\n--- Testing Skip & Disconnect Flow ---");
  const skipPromiseB = new Promise<any>((resolve) => socketB.on("partner-left", resolve));
  socketA.emit("skip-partner");
  const leftEvent = await skipPromiseB;
  console.log("✓ Socket B received partner-left event:", leftEvent);

  socketA.disconnect();
  socketB.disconnect();

  console.log("\n🎉 ALL TESTS PASSED! Clean, native Omegle flow working seamlessly! 🎉\n");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ QA Test failed:", err);
  process.exit(1);
});
