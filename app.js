var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const postRouter = require("./routes/posts");
const authRouter = require("./routes/auth");

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const main = async () => {
  await mongoose.connect(process.env.MONGODB);
};
main().catch((err) => {
  console.log(err);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/posts", postRouter);
app.use("/api", authRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.status(400).json(err);
});

module.exports = app;
