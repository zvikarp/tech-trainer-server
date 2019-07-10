const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ProfileSchema = new Schema({
  nickname: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  lastEdited: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
});
module.exports = Profile = mongoose.model("Profile", ProfileSchema);