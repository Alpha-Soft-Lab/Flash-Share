require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL
};

module.exports = config;