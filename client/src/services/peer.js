export const createPeerConnection = ({
  socket,
  roomId,
  isSender,
  onDataChannel,
  onConnectionStateChange,
}) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302",
      },
      {
        urls: "stun:stun2.l.google.com:19302",
      },
    ],
    iceCandidatePoolSize: 10,
  });

  peer.onicecandidate = (event) => {
    if (!event.candidate) {
      console.log("🧊 ICE gathering complete");
      return;
    }

    console.log(
      "🧊 Sending ICE candidate:",
      event.candidate.candidate
    );

    socket.emit("ice-candidate", {
      roomId,
      candidate: event.candidate,
    });
  };

  peer.onicecandidateerror = (event) => {
    console.error(
      "❌ ICE candidate error:",
      event
    );
  };

  peer.oniceconnectionstatechange = () => {
    console.log(
      "🧊 ICE connection state:",
      peer.iceConnectionState
    );
  };

  peer.onicegatheringstatechange = () => {
    console.log(
      "🧊 ICE gathering state:",
      peer.iceGatheringState
    );
  };

  peer.onsignalingstatechange = () => {
    console.log(
      "📡 Signaling state:",
      peer.signalingState
    );
  };

  peer.onconnectionstatechange = () => {
    console.log(
      "🌐 WebRTC connection state:",
      peer.connectionState
    );

    onConnectionStateChange?.(
      peer.connectionState
    );
  };

  peer.ondatachannel = (event) => {
    console.log(
      "📡 Data channel received:",
      event.channel.label
    );

    onDataChannel?.(event.channel);
  };

  peer.onnegotiationneeded = () => {
    console.log(
      "📡 WebRTC negotiation needed"
    );
  };

  return peer;
};