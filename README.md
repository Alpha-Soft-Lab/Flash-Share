# ⚡ FlashShare

![React](https://img.shields.io/badge/React-61DAFB?logo=react\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwind-css\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io\&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?logo=webrtc\&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa\&logoColor=white)
![Render](https://img.shields.io/badge/Render-FF4F00?logo=render\&logoColor=white)

**FlashShare** is a fast, privacy-focused **peer-to-peer file sharing PWA** built for direct file transfers between devices using **WebRTC**.

FlashShare does **not require nearby-device discovery or the same Wi-Fi network**. Devices can communicate across different networks, such as Wi-Fi and mobile data, when a WebRTC connection can be established.

### 🚀 Features

* ⚡ **Fast P2P File Sharing** — Direct device-to-device file transfers using WebRTC
* 🔒 **Privacy First** — Files are transferred directly between peers
* 🌐 **Different Networks** — Sender and receiver don't need to use the same Wi-Fi
* 📱 **No Nearby Requirement** — No nearby-device discovery is required
* 📦 **Chunk-Based Transfer** — Files are transferred in manageable chunks
* 📊 **Transfer Progress** — Track sending and receiving progress
* 📲 **PWA Support** — Install FlashShare like a native application
* 🖥️ **Cross-Platform** — Works on phones, laptops, and desktops
* 🧩 **No MongoDB Required** — No database is required
* 🔌 **Simple Setup** — Clone the repository and run the client and server

### 🛠️ Tech Stack

**Frontend**

* ⚛️ React
* ⚡ Vite
* 🎨 Tailwind CSS
* 📱 PWA

**Backend / Signaling**

* 🟢 Node.js
* 🚂 Express.js
* 🔌 Socket.IO

**File Transfer**

* 🌐 WebRTC
* 📡 WebRTC DataChannel
* 📦 Chunk-Based File Transfer

### 🌍 Network Support

FlashShare does **not require** both devices to be on the same network.

For example:

📱 **Phone — Mobile Data**
↕️
🌐 **Internet**
↕️
💻 **Laptop — Wi-Fi**

You don't need:

❌ Same Wi-Fi
❌ Bluetooth
❌ Nearby-device discovery
❌ Cloud file storage
❌ MongoDB

> **Note:** WebRTC connectivity depends on the network/NAT configuration. For reliable connections across restrictive networks, a STUN/TURN server may be required.

### 🔄 How It Works

1. 👤 Sender opens FlashShare and creates a sharing session.
2. 👤 Receiver joins the session.
3. 🔌 Socket.IO handles the signaling required to establish the connection.
4. 🤝 WebRTC creates a peer-to-peer connection.
5. 📦 The selected file is divided into chunks.
6. 🚀 Chunks are transferred through the WebRTC DataChannel.
7. 💾 The receiver reconstructs the file and downloads it.

The signaling server helps establish the connection. **The actual file data is transferred through WebRTC between the connected peers.**

---

## 💻 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Alpha-Soft-Lab/Flash-Share.git
cd FlashShare
```

### 2️⃣ Install Client Dependencies

Go to the `client` folder:

```bash
cd client
```

Install the frontend dependencies:

```bash
npm install
```

### 3️⃣ Start the Client

Run the Vite development server:

```bash
npm run dev
```

Keep this terminal running.

### 4️⃣ Open a New Terminal

Go back to the project root:

```bash
cd ..
```

### 5️⃣ Install Server Dependencies

Go to the `server` folder:

```bash
cd server
```

Install the backend dependencies:

```bash
npm install
```

### 6️⃣ Start the Server

```bash
node server
```

Your FlashShare client and signaling server are now running locally.

### 📁 Project Structure

```text
FlashShare/
│
├── client/              # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/              # Node.js + Express + Socket.IO
│   ├── package.json
│   └── ...
│
└── README.md
```

### 🔐 Privacy

FlashShare is built around **peer-to-peer file transfer**. Files are not stored in MongoDB or uploaded to cloud storage. The signaling server is used to help establish the WebRTC connection, while the actual file transfer takes place between peers whenever a direct connection can be established.

---

## ⚡ FlashShare

**Share files. Fast. Direct. Private.**

Built with ❤️ using **React + Vite + Tailwind CSS + Node.js + Express + Socket.IO + WebRTC**.
