const User = require("../models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Post = require("../models/post");

const run = async () => {
  // Set up mongoose connection
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);

  const main = async () => {
    await mongoose.connect(process.env.MONGODB);
  };
  main().catch((err) => {
    console.log(err);
  });

  await Post.updateMany({}, { $rename: { timestamp: "createdTimestamp" } });
};

run();
