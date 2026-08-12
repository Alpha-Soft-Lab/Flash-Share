import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "../services/socket";
import { createPeerConnection } from "../services/peer";

const useWebRTC = ({ roomId, isSender }) => {
  const peerRef = useRef(null);
  const channelRef = useRef(null);

  const receiveChunksRef = useRef([]);
  const receiveFileRef = useRef(null);
  const receiveBytesRef = useRef(0);

  const iceCandidatesQueueRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);

  const [connectionState, setConnectionState] =
    useState("new");

  const [dataChannelReady, setDataChannelReady] =
    useState(false);

  const [receiveProgress, setReceiveProgress] =
    useState(0);

  const [receivedFile, setReceivedFile] =
    useState(null);

  const setupDataChannel = useCallback(
    (channel) => {
      if (!channel) return;

      channelRef.current = channel;
      channel.binaryType = "arraybuffer";
      channel.bufferedAmountLowThreshold =
        2 * 1024 * 1024;

      channel.onopen = () => {
        setDataChannelReady(true);
      };

      channel.onclose = () => {
        setDataChannelReady(false);
      };

      channel.onerror = (error) => {
        const message =
          error?.error?.message || "";

        if (
          message.includes(
            "User-Initiated Abort"
          ) ||
          message.includes("Close called")
        ) {
          return;
        }

        console.error(
          "❌ Data channel error:",
          error
        );

        setDataChannelReady(false);
      };

      channel.onmessage = (event) => {
        if (isSender) return;

        const data = event.data;

        if (typeof data === "string") {
          try {
            const message =
              JSON.parse(data);

            if (
              message.type ===
              "file-start"
            ) {
              receiveChunksRef.current =
                [];

              receiveFileRef.current = {
                name: message.name,
                type:
                  message.mimeType ||
                  "application/octet-stream",
                size: message.size,
              };

              receiveBytesRef.current = 0;

              setReceiveProgress(0);
              setReceivedFile(null);

              return;
            }

            if (
              message.type ===
              "file-end"
            ) {
              const fileInfo =
                receiveFileRef.current;

              if (!fileInfo) {
                console.error(
                  "❌ File information missing"
                );
                return;
              }

              const blob = new Blob(
                receiveChunksRef.current,
                {
                  type: fileInfo.type,
                }
              );

              setReceivedFile({
                blob,
                name: fileInfo.name,
              });

              setReceiveProgress(100);

              receiveChunksRef.current =
                [];

              receiveFileRef.current =
                null;

              receiveBytesRef.current = 0;
            }
          } catch (error) {
            console.error(
              "❌ Message parsing error:",
              error
            );
          }

          return;
        }

        if (
          data instanceof ArrayBuffer
        ) {
          receiveChunksRef.current.push(
            data
          );

          receiveBytesRef.current +=
            data.byteLength;
        } else if (
          data instanceof Blob
        ) {
          receiveChunksRef.current.push(
            data
          );

          receiveBytesRef.current +=
            data.size;
        } else {
          return;
        }

        const fileInfo =
          receiveFileRef.current;

        if (
          fileInfo &&
          fileInfo.size > 0
        ) {
          const progress = Math.min(
            100,
            Math.round(
              (receiveBytesRef.current /
                fileInfo.size) *
                100
            )
          );

          setReceiveProgress(progress);
        }
      };
    },
    [isSender]
  );

  useEffect(() => {
    if (!roomId) return;

    remoteDescriptionSetRef.current =
      false;

    iceCandidatesQueueRef.current = [];

    const handleOffer = async ({
      offer,
    }) => {
      if (isSender) return;

      try {
        const peer =
          peerRef.current;

        if (!peer) {
          console.error(
            "❌ Peer connection not ready"
          );
          return;
        }

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        remoteDescriptionSetRef.current =
          true;

        const queuedCandidates =
          iceCandidatesQueueRef.current;

        for (
          const candidate of
          queuedCandidates
        ) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              "❌ ICE candidate error:",
              error
            );
          }
        }

        iceCandidatesQueueRef.current =
          [];

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        socket.emit(
          "webrtc-answer",
          {
            roomId,
            answer,
          }
        );
      } catch (error) {
        console.error(
          "❌ WebRTC offer error:",
          error
        );
      }
    };

    const handleAnswer = async ({
      answer,
    }) => {
      if (!isSender) return;

      try {
        const peer =
          peerRef.current;

        if (!peer) {
          console.error(
            "❌ Peer connection not ready"
          );
          return;
        }

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        remoteDescriptionSetRef.current =
          true;

        const queuedCandidates =
          iceCandidatesQueueRef.current;

        for (
          const candidate of
          queuedCandidates
        ) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              "❌ ICE candidate error:",
              error
            );
          }
        }

        iceCandidatesQueueRef.current =
          [];
      } catch (error) {
        console.error(
          "❌ WebRTC answer error:",
          error
        );
      }
    };

    const handleIceCandidate = async ({
      candidate,
    }) => {
      if (!candidate) return;

      if (
        !remoteDescriptionSetRef.current
      ) {
        iceCandidatesQueueRef.current.push(
          candidate
        );

        return;
      }

      try {
        const peer =
          peerRef.current;

        if (!peer) return;

        await peer.addIceCandidate(
          new RTCIceCandidate(
            candidate
          )
        );
      } catch (error) {
        console.error(
          "❌ ICE candidate error:",
          error
        );
      }
    };

    socket.on(
      "webrtc-offer",
      handleOffer
    );

    socket.on(
      "webrtc-answer",
      handleAnswer
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    const peer =
      createPeerConnection({
        socket,
        roomId,
        isSender,

        onDataChannel: (channel) => {
          setupDataChannel(channel);
        },

        onConnectionStateChange: (
          state
        ) => {
          setConnectionState(state);
        },
      });

    peerRef.current = peer;

    if (isSender) {
      const channel =
        peer.createDataChannel(
          "file-transfer"
        );

      setupDataChannel(channel);
    }

    return () => {
      socket.off(
        "webrtc-offer",
        handleOffer
      );

      socket.off(
        "webrtc-answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );

      if (peerRef.current) {
        peerRef.current.close();
      }

      peerRef.current = null;
      channelRef.current = null;

      iceCandidatesQueueRef.current =
        [];

      remoteDescriptionSetRef.current =
        false;

      setDataChannelReady(false);
      setConnectionState("closed");
    };
  }, [
    roomId,
    isSender,
    setupDataChannel,
  ]);

  const createOffer = useCallback(
    async () => {
      const peer =
        peerRef.current;

      if (!peer) {
        console.error(
          "❌ Peer connection not ready"
        );
        return;
      }

      if (!isSender) {
        console.error(
          "❌ Only sender can create offer"
        );
        return;
      }

      if (
        peer.signalingState !==
        "stable"
      ) {
        return;
      }

      try {
        const offer =
          await peer.createOffer();

        await peer.setLocalDescription(
          offer
        );

        socket.emit(
          "webrtc-offer",
          {
            roomId,
            offer,
          }
        );
      } catch (error) {
        console.error(
          "❌ Offer creation error:",
          error
        );
      }
    },
    [roomId, isSender]
  );

  const sendFile = useCallback(
    async (file) => {
      const channel =
        channelRef.current;

      if (
        !channel ||
        channel.readyState !== "open"
      ) {
        throw new Error(
          "Data channel is not ready"
        );
      }

      if (!file) {
        throw new Error(
          "No file selected"
        );
      }

      channel.send(
        JSON.stringify({
          type: "file-start",
          name: file.name,
          size: file.size,
          mimeType:
            file.type ||
            "application/octet-stream",
        })
      );

      const chunkSize =
        64 * 1024;

      const highWaterMark =
        8 * 1024 * 1024;

      const lowWaterMark =
        2 * 1024 * 1024;

      channel.bufferedAmountLowThreshold =
        lowWaterMark;

      let offset = 0;

      while (offset < file.size) {
        if (
          channel.bufferedAmount >
          highWaterMark
        ) {
          await new Promise(
            (resolve) => {
              let resolved = false;

              const cleanup = () => {
                channel.removeEventListener(
                  "bufferedamountlow",
                  handleLow
                );
              };

              const finish = () => {
                if (resolved) return;

                resolved = true;
                cleanup();
                resolve();
              };

              const handleLow = () => {
                if (
                  channel.bufferedAmount <=
                  lowWaterMark
                ) {
                  finish();
                }
              };

              channel.addEventListener(
                "bufferedamountlow",
                handleLow
              );

              setTimeout(
                finish,
                1000
              );
            }
          );
        }

        if (
          channel.readyState !== "open"
        ) {
          throw new Error(
            "Data channel closed during transfer"
          );
        }

        const chunk = file.slice(
          offset,
          offset + chunkSize
        );

        const buffer =
          await chunk.arrayBuffer();

        channel.send(buffer);

        offset +=
          buffer.byteLength;
      }

      if (
        channel.readyState === "open"
      ) {
        channel.send(
          JSON.stringify({
            type: "file-end",
          })
        );
      }
    },
    []
  );

  return {
    connectionState,
    dataChannelReady,
    createOffer,
    sendFile,
    receiveProgress,
    receivedFile,
  };
};

export default useWebRTC;