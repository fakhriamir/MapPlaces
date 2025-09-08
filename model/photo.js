const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({
  userid: {
    type: mongoose.ObjectId,
    required: true
  },
  itemID: {
    type: mongoose.ObjectId,
    required: true
  },
  photo: { type: Buffer },
  varify: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
}, { versionKey: false });
module.exports = mongoose.model("photos", PhotoSchema);