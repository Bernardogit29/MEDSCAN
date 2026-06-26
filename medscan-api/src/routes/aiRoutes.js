const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { analyze } = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze", authMiddleware, upload.single("image"), analyze);

module.exports = router;
