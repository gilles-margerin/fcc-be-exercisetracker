const mongoose = require("mongoose")
const {Schema} = mongoose

const userSchema = new Schema({
  _id: String,
  username: String,
  exercises: Number
})

const User = mongoose.model("User", userSchema)

module.exports = User