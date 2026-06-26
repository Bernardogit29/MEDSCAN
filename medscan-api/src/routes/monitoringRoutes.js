const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMonitoring,
  createMonitoring,
  getDevices,
  createDevice
} = require("../controllers/monitoringController");

const router = express.Router();

router.get("/monitoring", authMiddleware, getMonitoring);
router.post("/monitoring", authMiddleware, createMonitoring);
router.get("/devices", authMiddleware, getDevices);
router.post("/devices", authMiddleware, createDevice);

module.exports = router;
