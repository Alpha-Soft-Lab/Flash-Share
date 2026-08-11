const express = require("express");
const { createSession } = require("../controllers/sessionController");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Flash Share server is running",
  });
});

router.post("/session", createSession);

module.exports = router;