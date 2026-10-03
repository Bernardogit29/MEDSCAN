const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  monitoredPersonId: { type: String, required: true, default: "self" },
  kind: { type: String, enum: ["medication", "allergy", "vaccine", "appointment"], required: true },
  name: { type: String, required: true },
  dose: String, times: [String], startDate: String, endDate: String,
  date: String, time: String, nextDate: String, location: String,
  reaction: String, severity: String, lot: String, notes: String,
  status: { type: String, default: "active" },
  archived: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ userId: 1, monitoredPersonId: 1, createdAt: -1 });
module.exports = mongoose.model("CareRecord", schema);
