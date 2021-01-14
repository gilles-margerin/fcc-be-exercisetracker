const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.error("err", err.stack));

const { Schema } = mongoose;
const userSchema = new Schema({
  _id: String,
  username: String,
  date: {type: Date, default: Date.now},
  duration: Number,
  description: String
})
const User = mongoose.model('User', userSchema)

/* function formatDate(date) {
  return typeof date !== 'string' ? 
   `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`  
  : date
} */

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", async (req, res) => {

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  })
  await user.save()
  
  res.send({
    useername: user.username,
    _id: user._id
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
