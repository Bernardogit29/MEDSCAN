const mongoose = require("mongoose");

const monitoringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  monitoredPersonId: { type: String, default: "self" },
  source: { type: String, enum: ["legacy", "recorded"], default: "legacy" },
  measuredAt: { type: Date, default: Date.now },
  note: { type: String, default: "", maxlength: 500 },
  heartRate: {
    type: Number,
    default: null
  },
  glucose: {
    type: Number,
    default: null
  },
  bloodPressure: {
    type: String,
    default: null
  },
  sleep: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "EstÃ¡vel"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

monitoringSchema.index({ userId: 1, monitoredPersonId: 1, measuredAt: -1 });

module.exports = mongoose.model("Monitoring", monitoringSchema);
