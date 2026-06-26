const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  monitoredPersonId: {
    type: String,
    default: "maria"
  },
  monitoredPersonName: {
    type: String,
    default: "Maria Silva"
  },
  type: {
    type: String,
    enum: ["exam", "image", "symptoms"],
    default: "symptoms"
  },
  symptoms: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  result: {
    type: Object,
    default: {}
  },
  possibleCondition: {
    type: String,
    default: ""
  },
  riskLevel: {
    type: String,
    default: "Baixo"
  },
  confidence: {
    type: Number,
    default: 0
  },
  recommendation: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Analysis", analysisSchema);
