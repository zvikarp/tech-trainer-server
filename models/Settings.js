const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const SettingsSchema = new Schema({
  websites: {
  },
  otherFields: {
  },
});
module.exports = Settings = mongoose.model("Settings", SettingsSchema);