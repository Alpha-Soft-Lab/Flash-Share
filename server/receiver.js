const { io } = require("socket.io-client");

const ROOM_ID = "KJ6BHA";

const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("✅ Receiver connected");
  console.log("Receiver Socket ID:", socket.id);

  socket.emit(
    "join-room",
    { roomId: ROOM_ID },
    (response) => {
      console.log("✅ Join response:", response);
    }
  );
});

socket.on("peer-joined", ({ peerId }) => {
  console.log("👤 Peer joined:", peerId);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});