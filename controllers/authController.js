const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

exports.postLogin = asyncHandler(async (req, res) => {
  try {
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
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 10800000,
          path: "/",
        });

        res.json({
          success: true,
          data: userInfo,
        });
      }
    );
  } catch (err) {
    res.status(401).json({
      message: "Invalid credentials",
    });
  }
});

exports.validateUser = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  console.log(req.cookies);

  jwt.verify(token, "secretkey", (err, userData) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "User time out, please log back in" });
    } else {
      return res.json({ success: true, data: userData });
    }
  });
});
