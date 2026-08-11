import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Download,
  FileCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { socket } from "../services/socket";
import useWebRTC from "../hooks/useWebRTC";
import { downloadFile } from "../utils/fileDownload";

const Receive = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const {
    connectionState,
    dataChannelReady,
    receiveProgress,
    receivedFile,
  } = useWebRTC({
    roomId: joined ? roomId : "",
    isSender: false,
  });

  const handleRoomChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    setRoomId(value);
    setError("");
  };

  const joinRoom = () => {
    if (roomId.length !== 6) {
      setError(
        "Enter a valid 6-character room code."
      );
      return;
    }

    setJoining(true);
    setError("");

    const handleConnect = () => {
      socket.emit(
        "join-room",
        { roomId },
        (response) => {
          setJoining(false);

          if (!response?.success) {
            setError(
              response?.message ||
                "Unable to join room."
            );
            return;
          }

          console.log(
            "✅ Joined room:",
            roomId
          );

          setJoined(true);
        }
      );
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();

      socket.once(
        "connect",
        handleConnect
      );
    }
  };

  const handleDownload = () => {
    if (!receivedFile) {
      return;
    }

    downloadFile(
      receivedFile.blob,
      receivedFile.name
    );
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl pt-10">

        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <p className="text-xs uppercase tracking-[0.3em] text-white/30">
          Receive
        </p>

        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Enter room code
        </h1>

        <p className="mt-4 text-white/40">
          Enter the code shown on the sending device.
        </p>

        {!joined ? (
          <div className="mt-10">

            <input
              type="text"
              value={roomId}
              onChange={handleRoomChange}
              maxLength={6}
              placeholder="XXXXXX"
              className="w-full rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-6 text-center text-4xl font-bold tracking-[0.3em] text-white outline-none placeholder:text-white/10 focus:border-white/30"
            />

            {error && (
              <p className="mt-4 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={joinRoom}
              disabled={
                joining ||
                roomId.length !== 6
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joining ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Joining room...
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">

            <h2 className="text-2xl font-semibold">
              Connected
            </h2>

            <p className="mt-3 text-white/40">
              Room {roomId}
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">

              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Connection
              </p>

              <p className="mt-2 text-sm font-medium">
                {connectionState}
              </p>

              {connectionState ===
                "connecting" && (
                <p className="mt-3 text-sm text-white/30">
                  Connecting to sender...
                </p>
              )}

              {connectionState ===
                "connected" && (
                <p className="mt-3 text-sm text-green-400">
                  ✓ WebRTC connection established
                </p>
              )}

              {dataChannelReady && (
                <p className="mt-2 text-sm text-green-400">
                  ✓ Direct file channel ready
                </p>
              )}
            </div>


            {receiveProgress > 0 &&
              receiveProgress < 100 && (
                <div className="mt-8 border-t border-white/10 pt-6 text-left">

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/50">
                      Receiving file
                    </p>

                    <p className="text-sm font-semibold">
                      {receiveProgress}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-200"
                      style={{
                        width: `${receiveProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}


            {receivedFile && (
              <div className="mt-8 border-t border-white/10 pt-6">

                <div className="flex flex-col items-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                    <FileCheck
                      size={30}
                    />
                  </div>

                  <p className="mt-4 text-sm text-green-400">
                    ✓ File received successfully
                  </p>

                  <p className="mt-2 max-w-full truncate text-sm text-white/60">
                    {receivedFile.name}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleDownload
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90"
                  >
                    <Download
                      size={18}
                    />
                    Download File
                  </button>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
};

export default Receive;