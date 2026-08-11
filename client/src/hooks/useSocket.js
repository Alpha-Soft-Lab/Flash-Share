import { useEffect } from "react";
import { socket } from "../services/socket";

const useSocket = () => {
  useEffect(() => {
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  const connect = () => {
    if (!socket.connected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return {
    socket,
    connect,
    disconnect,
  };
};

export default useSocket;