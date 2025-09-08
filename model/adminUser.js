const mongoose = require("mongoose");

const AdminUserSchema = mongoose.Schema({
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
 
  usertype: {
    type: Boolean,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("adminUser", AdminUserSchema);