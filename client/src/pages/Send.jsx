import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import FilePicker from "../components/FilePicker";
import FilePreview from "../components/FilePreview";
import { socket } from "../services/socket";
import useWebRTC from "../hooks/useWebRTC";

const Send = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const {
    connectionState,
    dataChannelReady,
    createOffer,
    sendFile,
  } = useWebRTC({
    roomId,
    isSender: true,
  });

  const handleFilesSelected = (selectedFiles) => {
    setFiles((currentFiles) => [
      ...currentFiles,
      ...selectedFiles,
    ]);

    setError("");
  };

  const removeFile = (index) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    const handlePeerJoined = ({ peerId }) => {
      console.log(
        "✅ Receiver joined:",
        peerId
      );

      setTimeout(() => {
        console.log(
          "📤 Receiver joined. Creating WebRTC offer..."
        );

        createOffer();
      }, 300);
    };

    socket.on(
      "peer-joined",
      handlePeerJoined
    );

    return () => {
      socket.off(
        "peer-joined",
        handlePeerJoined
      );
    };
  }, [createOffer]);

  const createRoom = () => {
    if (files.length === 0) {
      setError(
        "Please select at least one file."
      );
      return;
    }

    setLoading(true);
    setError("");

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit(
        "create-room",
        (response) => {
          setLoading(false);

          if (!response?.success) {
            setError(
              response?.message ||
                "Failed to create room."
            );
            return;
          }

          console.log(
            "✅ Room created:",
            response.roomId
          );

          setRoomId(response.roomId);
        }
      );
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once(
        "connect",
        handleConnect
      );
    }
  };

  const handleSendFiles = async () => {
    if (!dataChannelReady) {
      setError(
        "Direct connection is not ready yet."
      );
      return;
    }

    if (files.length === 0) {
      setError(
        "Please select at least one file."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      for (const file of files) {
        console.log(
          "📤 Sending:",
          file.name
        );

        await sendFile(file);
      }

      console.log(
        "✅ All files sent successfully"
      );
    } catch (error) {
      console.error(
        "❌ File transfer error:",
        error
      );

      setError(
        error?.message ||
          "Failed to send files."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="mb-10 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <p className="text-xs uppercase tracking-[0.3em] text-white/30">
          Send
        </p>

        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          Choose your files
        </h1>

        <p className="mt-4 text-white/40">
          Select the files you want to send.
        </p>

        <div className="mt-10">
          <FilePicker
            onFilesSelected={
              handleFilesSelected
            }
          />

          <FilePreview
            files={files}
            onRemove={removeFile}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {!roomId &&
          files.length > 0 && (
            <button
              type="button"
              onClick={createRoom}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Creating room...
                </>
              ) : (
                <>
                  Create Transfer Room
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}

        {roomId && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
              Room Code
            </p>

            <p className="mt-4 text-5xl font-bold tracking-[0.25em]">
              {roomId}
            </p>

            <p className="mt-4 text-sm text-white/40">
              Share this code with the receiving
              device.
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
                  Connecting to receiver...
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

            {dataChannelReady && (
              <button
                type="button"
                onClick={handleSendFiles}
                disabled={sending}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Sending files...
                  </>
                ) : (
                  <>
                    Send {files.length}{" "}
                    {files.length === 1
                      ? "File"
                      : "Files"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Send;