const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

exports.postLogin = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  // Authenticate later

  const userInfo = {
    username: user.username,
    id: user._id,
  };

  jwt.sign(
    { user: userInfo },
    "secretkey",
    { expiresIn: "3h" },
    (err, token) => {
      res.json({
        token: token,
      });
    }
  );
});
