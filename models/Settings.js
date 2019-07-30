const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
  accounts: Schema.Types.Mixed
});

module.exports = Settings = mongoose.model("Settings", SettingsSchema);