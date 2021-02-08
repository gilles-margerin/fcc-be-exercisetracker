const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
  })

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

const { Schema } = mongoose;
const userSchema = new Schema({
  _id: String,
  username: String,
  log: Array
});


const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", async(req, res) => {
  const checkUser = await User.exists({username: req.body.username})

  if (checkUser) {
    res.status(409).send('User already exists') //conflict between new user and exisiting user with same name
    return
  } 

  const user = await new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  }).save();

  res.send({
    username: user.username,
    _id: user._id
  });
});


app.get("/api/exercise/users", async(req, res) => {
  const users = await User.find({}).catch(err => {
    if(err) res.sendStatus(500) //if users array can't be returned failure is due to server
    return
  })
  res.send(users.map(user =>
    ({username: user.username, _id: user._id})
  ))
})

app.post("/api/exercise/add", async(req, res) => {
  const exercise = {
    description: req.body.description,
    duration: Number(req.body.duration),
    date: req.body.date ? new Date(req.body.date) : new Date()
  }

  try {
    const user = await User.findById(req.body.userId)
    user.log.push(exercise)

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
})

app.get("/api/exercise/log", async(req, res) => {
  const from = req.query.from ? new Date(req.query.from) : ""
  const to = req.query.to ? new Date(req.query.to) : ""

  try {
    const user = await User.findById(req.query.userId)

    const log = user.log.filter(exercise => {
      if (from && to) {
        return (exercise.date >= from && exercise.date <= to)
      } else if (from) {
        return exercise.date >= from
      } else if (to) {
        return exercise.date <= to
      }
      return exercise
    }).slice(0, req.query.limit);

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
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

    
