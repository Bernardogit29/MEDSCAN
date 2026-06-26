const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: true
  },
  relatives: {
    type: Array,
    default: []
  },
  settings: {
    privacy: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    appPreferences: {
      type: Object,
      default: {}
    }
  }
});

module.exports = mongoose.model("Profile", profileSchema);
