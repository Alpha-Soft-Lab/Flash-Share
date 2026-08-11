# ⚡ FlashShare

![React](https://img.shields.io/badge/React-61DAFB?logo=react\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwind-css\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io\&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?logo=webrtc\&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa\&logoColor=white)
![Render](https://img.shields.io/badge/Render-FF4F00?logo=render\&logoColor=white)

**FlashShare** is a fast, privacy-focused **peer-to-peer file sharing PWA** inspired by Quick Share. It uses **WebRTC** to transfer files directly between devices without uploading them to a cloud server.

### 🚀 Features

* ⚡ **Fast P2P File Sharing** — Direct device-to-device transfers using WebRTC
* 🔒 **Privacy First** — Files are transferred directly between peers
* 🌐 **Works Across Different Networks** — Devices don't need to be connected to the same Wi-Fi
* 📱 **No Nearby Device Requirement** — No Bluetooth or nearby-device discovery required
* 💾 **Large File Support** — Designed for efficient chunk-based file transfers
* 📊 **Transfer Progress** — Track upload and download progress
* 📲 **PWA Support** — Install and use FlashShare like a native app
* 🖥️ **Cross-Platform** — Works on phones, laptops, and desktops
* 🧩 **No MongoDB Required** — No database is required
* 🔌 **Local Development Ready** — Clone the repository and run it locally

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
* 📦 Chunk-based file transfer

### 🌍 Network Support

FlashShare is designed to work across different networks.

You **don't need**:

❌ Same Wi-Fi
❌ Bluetooth
❌ Nearby-device discovery
❌ Cloud file storage
❌ MongoDB

For example:

📱 Phone using mobile data
↕️
🌐 Internet
↕️
💻 Laptop using Wi-Fi

> **Note:** Depending on the network/NAT configuration, WebRTC may require a STUN/TURN server for reliable connectivity across different networks.

### 💻 Run Locally

Clone the repository:

```bash
git clone <Alpha-Soft-Lab/Flash-Share.git>
cd FlashShare
```

Install dependencies:

```bash
npm install
```

Install server dependencies:

```bash
cd server
npm install
```

Start the server:

```bash
node server
```

Then start the frontend:

```bash
npm run dev
```

### 🔐 Privacy

FlashShare is built around **peer-to-peer file transfer**. Files are not stored in a database or uploaded to cloud storage. The signaling server helps establish the WebRTC connection, while the actual file transfer happens directly between peers whenever a direct connection can be established.

---

### ⚡ FlashShare

**Share files. Fast. Direct. Private.**

Built with ❤️ using BY Ashish Devadiga & Alpha Software Lab
