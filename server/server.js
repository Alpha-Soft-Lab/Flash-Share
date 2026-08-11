const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const config = require("./config/config");
const healthRoutes = require("./routes/healthRoutes");
const setupSignaling = require("./socket/signaling");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ["GET", "POST"]
  }
});

app.use(
  cors({
    origin: config.clientUrl
  })
);

app.use(express.json());

app.use("/api/health", healthRoutes);

setupSignaling(io);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flash Share API is running"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

server.listen(config.port, () => {
  console.log(`
========================================
          FLASH SHARE SERVER
========================================
Server      : http://localhost:${config.port}
Health      : http://localhost:${config.port}/api/health
Environment : development
========================================
`);
});