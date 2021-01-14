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
  date: { type: Date, default: Date.now },
  duration: Number,
  description: String,
});
const User = mongoose.model("User", userSchema);

/* function formatDate(date) {
  return typeof date !== 'string' ? 
   `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`  
  : date
} */

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", async (req, res) => {
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  });
  const userCreated = await user.save();

  res.send({
    username: userCreated.username,
    _id: userCreated._id
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
