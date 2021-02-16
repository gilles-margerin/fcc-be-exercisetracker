const User = require("../models/User");
const Exercise = require("../models/Exercise")
const mongoose = require("mongoose")

const createExercise = async(req, res) => {
  try {
    const user = await User.findById(req.body.userId)
    
    const exercise = await new Exercise({
      _id: new mongoose.Types.ObjectId(),
      userId: user._id.toString(),
      description: req.body.description,
      duration: Number(req.body.duration),
      date: req.body.date ? new Date(req.body.date) : new Date()
    }).save()

    const result = await user.save()

    res.send({
      _id: result._id,
      username: result.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description
    })

  } catch (err) {
    if (err instanceof TypeError) {
      res.status(404).send('User not found') //handling unknown id
      return
    } else {
      res.sendStatus(500) //server error when trying to user.save()
    }
  }
}

module.exports = createExercise