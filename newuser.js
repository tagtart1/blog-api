const User = require("./models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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

  bcrypt.hash(process.env.TESTPW, 10, async (err, hashedPassword) => {
    const newUser = new User({
      username: "tagtart2",
      password: hashedPassword,
    });

    await newUser.save();
  });
};

run();
