const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

exports.postLogin = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: "tagtart2" });
  // Authenticate later

  jwt.sign({ user: user }, "secretkey", (err, token) => {
    res.json({
      token: token,
    });
  });
});
