const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  battery: {
    type: Number,
    default: 100
  },
  connected: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Device", deviceSchema);
