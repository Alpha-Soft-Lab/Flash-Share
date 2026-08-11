const generateRoom = require("../utils/generateRoom");

const rooms = new Map();

const setupSignaling = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("create-room", (callback) => {
      let roomId;

      do {
        roomId = generateRoom();
      } while (rooms.has(roomId));

      rooms.set(roomId, {
        sender: socket.id,
        receiver: null,
      });

      socket.join(roomId);

      socket.roomId = roomId;
      socket.role = "sender";

      console.log(`Room created: ${roomId}`);

      callback?.({
        success: true,
        roomId,
      });
    });

    socket.on("join-room", ({ roomId }, callback) => {
      const room = rooms.get(roomId);

      if (!room) {
        return callback?.({
          success: false,
          message: "Room not found",
        });
      }

      if (room.receiver) {
        return callback?.({
          success: false,
          message: "Room is already full",
        });
      }

      room.receiver = socket.id;

      socket.join(roomId);

      socket.roomId = roomId;
      socket.role = "receiver";

      console.log(`Receiver joined room: ${roomId}`);

      callback?.({
        success: true,
        roomId,
      });

      io.to(room.sender).emit("peer-joined", {
        peerId: socket.id,
      });
    });

    socket.on("receiver-ready", ({ roomId }) => {
      const room = rooms.get(roomId);

      if (!room) {
        console.log(
          `❌ Receiver-ready failed: ${roomId} not found`
        );
        return;
      }

      if (room.receiver !== socket.id) {
        console.log(
          "❌ Receiver-ready rejected: invalid receiver"
        );
        return;
      }

      console.log(
        `✅ Receiver ready for room: ${roomId}`
      );

      io.to(room.sender).emit("receiver-ready");
    });


    socket.on("webrtc-offer", ({ roomId, offer }) => {
      const room = rooms.get(roomId);

      if (!room) {
        return;
      }

      if (room.sender !== socket.id) {
        console.log("❌ Offer rejected: not sender");
        return;
      }

      console.log(
        `📤 WebRTC offer for room: ${roomId}`
      );

      io.to(room.receiver).emit("webrtc-offer", {
        offer,
      });
    });


    socket.on("webrtc-answer", ({ roomId, answer }) => {
      const room = rooms.get(roomId);

      if (!room) {
        return;
      }

      if (room.receiver !== socket.id) {
        console.log("❌ Answer rejected: not receiver");
        return;
      }

      console.log(
        `📤 WebRTC answer for room: ${roomId}`
      );

      io.to(room.sender).emit("webrtc-answer", {
        answer,
      });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      const room = rooms.get(roomId);

      if (!room) {
        return;
      }

      if (socket.id === room.sender) {
        io.to(room.receiver).emit("ice-candidate", {
          candidate,
        });

        return;
      }

      if (socket.id === room.receiver) {
        io.to(room.sender).emit("ice-candidate", {
          candidate,
        });
      }
    });

  
    socket.on("transfer-status", ({ roomId, status }) => {
      const room = rooms.get(roomId);

      if (!room) {
        return;
      }

      socket.to(roomId).emit("transfer-status", {
        status,
      });
    });

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id}`
      );

      const roomId = socket.roomId;

      if (!roomId) {
        return;
      }

      const room = rooms.get(roomId);

      if (!room) {
        return;
      }

      socket.to(roomId).emit("peer-disconnected");

      rooms.delete(roomId);

      console.log(
        `Room removed: ${roomId}`
      );
    });
  });
};

module.exports = setupSignaling;