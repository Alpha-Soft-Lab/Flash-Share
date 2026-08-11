const generateRoom = require("../utils/generateRoom");

const createSession = (req, res) => {
  const roomId = generateRoom();

  res.status(201).json({
    success: true,
    roomId,
  });
};

module.exports = {
  createSession,
};