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
    res.send('User already exists')
  } else {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
    });
    const userCreated = await user.save();
  
    res.send({
      username: userCreated.username,
      _id: userCreated._id
    });
  }
});


app.get("/api/exercise/users", async(req, res) => {
  const users = await User.find({})
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

  const user = await User.findById(req.body.userId).catch(err => console.log(err))

  user.log.push(exercise)

  const result = await user.save().catch(err => console.log(err))

  res.send({
    _id: result._id,
    username: result.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  })
})

app.get("/api/exercise/log", async(req, res) => {
  const from = req.query.from ? new Date(req.query.from) : ""
  const to = req.query.to ? new Date(req.query.to) : ""

  const user = await User.findById(req.query.userId).catch(err => console.log(err))

  const result = user.log.filter(exercise => {
    if (from && to) {
      return (exercise.date >= from && exercise.date <= to)
    } else if (from) {
      return exercise.date >= from
    } else if (to) {
      return exercise.date <= to
    }
    return exercise
  })

  const filteredResult = result.slice(0, req.query.limit);
  res.send(filteredResult)
})

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

    
