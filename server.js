const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const createUser = require("./controllers/createUser.js");
const getUsers = require("./controllers/getUsers.js");
const addExercise = require("./controllers/createExercise.js");
const getExercises = require("./controllers/getExercises.js");

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
  })

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", createUser)
app.get("/api/exercise/users", getUsers)
app.post("/api/exercise/add", addExercise)
app.get("/api/exercise/log", getExercises);

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

    
