const User = require("../models/User.js")  

const getUsers = async(req, res) => {
  const users = await User.find({}).catch(err => {
    if(err) res.sendStatus(500) //if users array can't be returned failure is due to server
    return
  })
  res.send(users.map(user =>
    ({username: user.username, _id: user._id})
  ))
}

module.exports = getUsers