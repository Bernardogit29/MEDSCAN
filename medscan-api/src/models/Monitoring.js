const mongoose = require("mongoose");

const monitoringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  heartRate: {
    type: Number,
    default: 82
  },
  glucose: {
    type: Number,
    default: 98
  },
  bloodPressure: {
    type: String,
    default: "120/80"
  },
  sleep: {
    type: String,
    default: "7h 30m"
  },
  status: {
    type: String,
    default: "Estável"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Monitoring", monitoringSchema);
