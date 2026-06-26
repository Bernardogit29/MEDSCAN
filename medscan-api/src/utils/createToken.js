const jwt = require("jsonwebtoken");

function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "medscan_dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = createToken;
