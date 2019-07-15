const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  chats: {
    type: [String],
    default: []
  },
  accounts: {
    type: Object,
    default: {}
  },
});
module.exports = User = mongoose.model("Users", UserSchema);