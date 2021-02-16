const User = require("../models/User")
const Exercise = require("../models/Exercise")

const getExercises = async(req, res) => {
  const from = req.query.from ? new Date(req.query.from) : ""
  const to = req.query.to ? new Date(req.query.to) : ""

  try {
    const user = await User.findById(req.query.userId)
    const exercises = await Exercise.find({userId: req.query.userId})

    const log = exercises.filter(exercise => {
      if (from && to) {
        return (exercise.date >= from && exercise.date <= to)
      } else if (from) {
        return exercise.date >= from
      } else if (to) {
        return exercise.date <= to
      }
      return exercise
    }).slice(0, req.query.limit)
      .map(item => {
        return {
          description: item.description,
          duration: item.duration,
          date: item.date
        }
      })

    res.send({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log  
    })

  } catch (err) {
    res.status(404).send('User not found') //handling unknown id
    return
  }
}

module.exports = getExercises