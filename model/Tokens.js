const mongoose = require("mongoose");

//This Document will be Auto Removed After 12 hours
const tokenSchema = new mongoose.Schema({
  invalidToken: { type: String, require: true },
  expire_at: { type: Date, default: Date.now, expires: "43200s" },
});
module.exports = mongoose.model("InvalidTokens", tokenSchema);
