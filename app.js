var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
const AppError = require("./utils/appError");

const postRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comment");
const draftRouter = require("./routes/drafts");

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
app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use("/api/posts", postRouter);
app.use("/api/drafts", draftRouter);
app.use("/api/posts/:postId/comments", commentRouter);
app.use("/api", authRouter);

// error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    // Handle operational errors by returning a specific error message to the client.
    console.log(err);
    return res
      .status(err.statusCode)
      .json({ code: err.code, messages: err.messages });
  }

  // Handle other unknown errors.
  console.error("An unknown error occurred:", err);
  res
    .status(500)
    .json({ code: "UNKNOWN", messages: ["An unexpected error occurred"] });
});

module.exports = app;
