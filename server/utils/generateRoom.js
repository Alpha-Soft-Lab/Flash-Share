const generateRoom = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let roomId = "";

  for (let i = 0; i < 6; i++) {
    roomId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return roomId;
};

module.exports = generateRoom;