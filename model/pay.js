const mongoose = require("mongoose");

const PaySchema = mongoose.Schema({
  userid: {
    type: mongoose.ObjectId,
    required: true
  },
  itemid: {
    type: mongoose.ObjectId,
    required: true
  },
  type: {
    type: Number
  },
  refid: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
}, { versionKey: false });
module.exports = mongoose.model("pay", PaySchema);