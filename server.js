
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const verify = require("./modules/verifyToken");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

//Set View Engine and Static Directory Path
const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.set("view engine", "ejs");

//Import routes
const authRouter = require("./routes/authRouter");
const postRouter = require("./routes/posts-router");

//Connect to DataBase
mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//MiddleWares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use("/user", authRouter);
app.use("/", postRouter);

let port = process.env.PORT || 3500;

app.get("*", verify, async function (req, res) {
  res.redirect("/");
});

app.listen(port, function () {
  return console.log(`Listening on localhost:${port}`);
});
