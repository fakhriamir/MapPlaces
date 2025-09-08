const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  mobileActive: {
    type: Boolean,
    default:0
  },
  usertype: {
    type: Boolean,
    default:0
  },
  gender: {
    type: Boolean,
    default:0
  },
  accessToken: {
    type: String
   
  },
  googleLogin: {
    type: Boolean

  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);