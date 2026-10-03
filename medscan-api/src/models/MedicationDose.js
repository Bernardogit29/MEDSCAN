const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  monitoredPersonId: { type: String, required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "CareRecord", required: true },
  name: String, dose: String, date: { type: String, required: true }, time: { type: String, required: true },
  takenAt: { type: Date, default: Date.now }
});
schema.index({ userId: 1, medicationId: 1, date: 1, time: 1 }, { unique: true });
module.exports = mongoose.model("MedicationDose", schema);
