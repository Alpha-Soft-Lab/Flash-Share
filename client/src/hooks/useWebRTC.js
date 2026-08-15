import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "../services/socket";
import { createPeerConnection } from "../services/peer";

const CHUNK_SIZE = 256 * 1024;
const HIGH_WATER_MARK = 12 * 1024 * 1024;
const LOW_WATER_MARK = 4 * 1024 * 1024;

const UI_UPDATE_INTERVAL_MS = 100;

async function chainHash(prevHashBytes, chunkBuffer) {
  const combined = new Uint8Array(
    prevHashBytes.length + chunkBuffer.byteLength
  );
  combined.set(prevHashBytes, 0);
  combined.set(new Uint8Array(chunkBuffer), prevHashBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(digest);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ZERO_HASH = new Uint8Array(32);

const useWebRTC = ({ roomId, isSender }) => {
  const peerRef = useRef(null);
  const channelRef = useRef(null);

  const receiveChunksRef = useRef([]);
  const receiveFileRef = useRef(null);
  const receiveBytesRef = useRef(0);
  const receiveProgressTimerRef = useRef(null);
  const receiveStartTimeRef = useRef(null);

  const iceCandidatesQueueRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);

  const saveDirHandleRef = useRef(null);
  const writableStreamPromiseRef = useRef(null);
  const writeChainRef = useRef(Promise.resolve());

  const receiveHashChainRef = useRef(Promise.resolve(ZERO_HASH));
  const sendHashChainRef = useRef(Promise.resolve(ZERO_HASH));

  const [connectionState, setConnectionState] = useState("new");
  const [dataChannelReady, setDataChannelReady] = useState(false);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receiveSpeed, setReceiveSpeed] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [receiveSavedToDisk, setReceiveSavedToDisk] = useState(false);
  const [receiveIntegrity, setReceiveIntegrity] = useState(null);
  const [canSaveToDisk, setCanSaveToDisk] = useState(
    typeof window !== "undefined" && "showDirectoryPicker" in window
  );
  const [sendProgress, setSendProgress] = useState(0);
  const [sendSpeed, setSendSpeed] = useState(0);
  const [sendBytes, setSendBytes] = useState(0);
  const [sendElapsed, setSendElapsed] = useState(0);

  const chooseSaveDirectory = useCallback(async () => {
    if (!("showDirectoryPicker" in window)) {
      setCanSaveToDisk(false);
      return false;
    }

    try {
      const handle = await window.showDirectoryPicker({
        mode: "readwrite",
      });

      saveDirHandleRef.current = handle;
      return true;
    } catch (error) {
      console.error("Directory picker error:", error);
      return false;
    }
  }, []);

  const resetReceiveState = useCallback(() => {
    receiveChunksRef.current = [];
    receiveFileRef.current = null;
    receiveBytesRef.current = 0;
    receiveStartTimeRef.current = null;
    writableStreamPromiseRef.current = null;
    writeChainRef.current = Promise.resolve();
    receiveHashChainRef.current = Promise.resolve(ZERO_HASH);

    if (receiveProgressTimerRef.current) {
      clearTimeout(receiveProgressTimerRef.current);
      receiveProgressTimerRef.current = null;
    }
  }, []);

  const setupDataChannel = useCallback(
    (channel) => {
      if (!channel) return;

      channelRef.current = channel;
      channel.binaryType = "arraybuffer";
      channel.bufferedAmountLowThreshold = LOW_WATER_MARK;

      channel.onopen = () => {
        setDataChannelReady(true);
      };

      channel.onclose = () => {
        setDataChannelReady(false);
      };

      channel.onerror = (error) => {
        console.error("DataChannel error:", error);
        setDataChannelReady(false);
      };

      channel.onmessage = (event) => {
        if (isSender) return;

        const data = event.data;

        if (typeof data === "string") {
          try {
            const message = JSON.parse(data);

            if (message.type === "file-start") {
              resetReceiveState();

              receiveFileRef.current = {
                name: message.name,
                type: message.mimeType || "application/octet-stream",
                size: message.size,
              };

              receiveBytesRef.current = 0;
              receiveStartTimeRef.current = performance.now();

              setReceiveProgress(0);
              setReceiveSpeed(0);
              setReceivedFile(null);
              setReceiveSavedToDisk(false);
              setReceiveIntegrity(null);

              if (saveDirHandleRef.current) {
                writableStreamPromiseRef.current = (async () => {
                  try {
                    const fileHandle =
                      await saveDirHandleRef.current.getFileHandle(
                        message.name,
                        { create: true }
                      );

                    const writable = await fileHandle.createWritable();
                    return writable;
                  } catch (error) {
                    console.error(
                      "Could not open file for streaming write, falling back to in-memory buffering:",
                      error
                    );
                    return null;
                  }
                })();
              } else {
                writableStreamPromiseRef.current = Promise.resolve(null);
              }

              return;
            }

            if (message.type === "file-end") {
              const fileInfo = receiveFileRef.current;

              if (!fileInfo) return;
              if (receiveBytesRef.current < fileInfo.size) return;

              (async () => {
                await writeChainRef.current;

                const writable = await writableStreamPromiseRef.current;

                if (writable) {
                  await writable.close();
                  setReceiveSavedToDisk(true);
                  setReceivedFile(null);
                } else {
                  const blob = new Blob(receiveChunksRef.current, {
                    type: fileInfo.type,
                  });

                  setReceivedFile({
                    blob,
                    name: fileInfo.name,
                  });

                  setReceiveSavedToDisk(false);
                }

                const finalHash = await receiveHashChainRef.current;
                const finalHex = bytesToHex(finalHash);

                if (message.hash) {
                  setReceiveIntegrity(
                    finalHex === message.hash ? "verified" : "failed"
                  );
                } else {
                  setReceiveIntegrity(null);
                }

                setReceiveProgress(100);
                setReceiveSpeed(0);

                resetReceiveState();
              })();

              return;
            }
          } catch {
            return;
          }

          return;
        }

        let buffer;

        if (data instanceof ArrayBuffer) {
          buffer = data;
        } else {
          return;
        }

        receiveBytesRef.current += buffer.byteLength;

        writeChainRef.current = writeChainRef.current.then(async () => {
          const writable = await writableStreamPromiseRef.current;

          if (writable) {
            await writable.write(buffer);
          } else {
            receiveChunksRef.current.push(buffer);
          }
        });

        receiveHashChainRef.current = receiveHashChainRef.current.then(
          (prevHash) => chainHash(prevHash, buffer)
        );

        const fileInfo = receiveFileRef.current;

        if (fileInfo && fileInfo.size > 0) {
          if (!receiveProgressTimerRef.current) {
            receiveProgressTimerRef.current = setTimeout(() => {
              const bytesNow = receiveBytesRef.current;

              const progress = Math.min(
                100,
                Math.round((bytesNow / fileInfo.size) * 100)
              );

              const elapsed =
                (performance.now() - receiveStartTimeRef.current) / 1000;

              setReceiveProgress(progress);
              setReceiveSpeed(elapsed > 0 ? bytesNow / elapsed : 0);

              receiveProgressTimerRef.current = null;
            }, UI_UPDATE_INTERVAL_MS);
          }
        }
      };
    },
    [isSender, resetReceiveState]
  );

  useEffect(() => {
    if (!roomId) return;

    remoteDescriptionSetRef.current = false;
    iceCandidatesQueueRef.current = [];

    const handleOffer = async ({ offer }) => {
      if (isSender) return;

      try {
        const peer = peerRef.current;
        if (!peer) return;

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescriptionSetRef.current = true;

        for (const candidate of iceCandidatesQueueRef.current) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {}
        }

        iceCandidatesQueueRef.current = [];

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("webrtc-answer", { roomId, answer });
      } catch (error) {
        console.error("WebRTC offer error:", error);
      }
    };

    const handleAnswer = async ({ answer }) => {
      if (!isSender) return;

      try {
        const peer = peerRef.current;
        if (!peer) return;

        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescriptionSetRef.current = true;

        for (const candidate of iceCandidatesQueueRef.current) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {}
        }

        iceCandidatesQueueRef.current = [];
      } catch (error) {
        console.error("WebRTC answer error:", error);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;

      if (!remoteDescriptionSetRef.current) {
        iceCandidatesQueueRef.current.push(candidate);
        return;
      }

      const peer = peerRef.current;
      if (!peer) return;

      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    const peer = createPeerConnection({
      socket,
      roomId,
      isSender,
      onDataChannel: (channel) => {
        setupDataChannel(channel);
      },
      onConnectionStateChange: (state) => {
        setConnectionState(state);
      },
    });

    peerRef.current = peer;

    if (isSender) {
      const channel = peer.createDataChannel("file-transfer", {
        ordered: true,
      });

      setupDataChannel(channel);
    }

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);

      resetReceiveState();

      if (peerRef.current) {
        peerRef.current.close();
      }

      peerRef.current = null;
      channelRef.current = null;

      iceCandidatesQueueRef.current = [];
      remoteDescriptionSetRef.current = false;

      setDataChannelReady(false);
      setConnectionState("closed");
      setReceiveSpeed(0);
    };
  }, [roomId, isSender, setupDataChannel, resetReceiveState]);

  const createOffer = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer || !isSender) return;
    if (peer.signalingState !== "stable") return;

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("webrtc-offer", { roomId, offer });
    } catch (error) {
      console.error("Offer creation error:", error);
    }
  }, [roomId, isSender]);

  const waitForBuffer = useCallback((channel) => {
    if (channel.bufferedAmount <= LOW_WATER_MARK) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let finished = false;

      const cleanup = () => {
        channel.removeEventListener("bufferedamountlow", onLow);
        channel.removeEventListener("close", onClose);
        channel.removeEventListener("error", onError);
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      };

      const fail = () => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error("Data channel closed while waiting"));
      };

      const onLow = () => {
        if (channel.bufferedAmount <= LOW_WATER_MARK) {
          finish();
        }
      };

      const onClose = () => fail();
      const onError = () => fail();

      channel.addEventListener("bufferedamountlow", onLow);
      channel.addEventListener("close", onClose);
      channel.addEventListener("error", onError);

      if (channel.bufferedAmount <= LOW_WATER_MARK) {
        finish();
      }
    });
  }, []);

  const sendFile = useCallback(
    async (file) => {
      const channel = channelRef.current;

      if (!channel || channel.readyState !== "open") {
        throw new Error("Data channel is not ready");
      }

      if (!file) {
        throw new Error("No file selected");
      }

      setSendProgress(0);
      setSendSpeed(0);
      setSendBytes(0);
      setSendElapsed(0);

      sendHashChainRef.current = Promise.resolve(ZERO_HASH);

      const startTime = performance.now();
      let lastUiUpdate = startTime;

      channel.send(
        JSON.stringify({
          type: "file-start",
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
        })
      );

      let offset = 0;

      while (offset < file.size) {
        if (channel.readyState !== "open") {
          throw new Error("Data channel closed during transfer");
        }

        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await chunk.arrayBuffer();

        while (
          channel.bufferedAmount + buffer.byteLength >
          HIGH_WATER_MARK
        ) {
          await waitForBuffer(channel);
        }

        if (channel.readyState !== "open") {
          throw new Error("Data channel closed during transfer");
        }

        channel.send(buffer);

        sendHashChainRef.current = sendHashChainRef.current.then(
          (prevHash) => chainHash(prevHash, buffer)
        );

        offset += buffer.byteLength;

        const now = performance.now();

        if (now - lastUiUpdate >= UI_UPDATE_INTERVAL_MS) {
          const elapsed = (now - startTime) / 1000;
          const speed = elapsed > 0 ? offset / elapsed : 0;

          setSendBytes(offset);
          setSendProgress(
            Math.min(100, Math.round((offset / file.size) * 100))
          );
          setSendSpeed(speed);
          setSendElapsed(elapsed);

          lastUiUpdate = now;
        }
      }

      if (channel.readyState !== "open") {
        throw new Error("Data channel closed before completion");
      }

      const finalHash = await sendHashChainRef.current;
      const finalHex = bytesToHex(finalHash);

      channel.send(
        JSON.stringify({
          type: "file-end",
          hash: finalHex,
        })
      );

      const totalElapsed = (performance.now() - startTime) / 1000;

      setSendProgress(100);
      setSendBytes(file.size);
      setSendElapsed(totalElapsed);
      setSendSpeed(totalElapsed > 0 ? file.size / totalElapsed : 0);
    },
    [waitForBuffer]
  );

  return {
    connectionState,
    dataChannelReady,
    createOffer,
    sendFile,
    receiveProgress,
    receiveSpeed,
    receivedFile,
    receiveSavedToDisk,
    receiveIntegrity,
    canSaveToDisk,
    chooseSaveDirectory,
    sendProgress,
    sendSpeed,
    sendBytes,
    sendElapsed,
  };
};

export default useWebRTC;