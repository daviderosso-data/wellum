const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  clerkId: String, // per collegare a Clerk
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', UserSchema)

