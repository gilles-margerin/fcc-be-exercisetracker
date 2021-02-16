const User = require("../models/User.js")  
const mongoose = require("mongoose")

const createUser = async(req, res) => {
  const checkUser = await User.exists({username: req.body.username})

  if (checkUser) {
    res.status(409).send('User already exists') //conflict between new user and exisiting user with same name
    return
  } 

  const user = await new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
    exercises: 0
  }).save();

  res.send({
    username: user.username,
    _id: user._id
  });
}

module.exports = createUser