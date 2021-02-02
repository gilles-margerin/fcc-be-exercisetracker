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

const formatDate = (...args) => {
  const weekDays = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ]
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const date = args.length > 0 ? new Date([...args]) : new Date()
  const year = date.getFullYear()
  const month = months[date.getMonth()]
  const day = date.getDate()
  const weekDay = weekDays[date.getDay()]
  return `${weekDay} ${month} ${day < 10 ? '0' + day : day} ${year}`
}

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
    date: req.body.date || formatDate() 
  }

  const user = await User.findById(req.body.userId).catch(err => console.log(err))

  user.log.push(exercise)

  const result = await user.save().catch(err => console.log(err))

  res.send({
    _id: result._id,
    username: result.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

/* {"_id":"600022187968d038e81e94e5","username":"qsdf","date":{"$date":{"$numberLong":"1610621464986"}},"__v":{"$numberInt":"0"}} */