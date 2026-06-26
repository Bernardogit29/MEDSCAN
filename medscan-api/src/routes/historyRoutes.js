const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listHistory,
  getHistoryItem,
  createHistoryItem
} = require("../controllers/historyController");

const router = express.Router();

router.get("/", authMiddleware, listHistory);
router.get("/:id", authMiddleware, getHistoryItem);
router.post("/", authMiddleware, createHistoryItem);

module.exports = router;
