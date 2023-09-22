const User = require("../models/user");
const AppError = require("../utils/appError");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

exports.postLogin = asyncHandler(async (req, res, next) => {
  if (!req.body.password || !req.body.username) {
    throw new AppError(
      "The username or password provided is incorrect",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const user = await User.findOne({ username: req.body.username });
  // Authenticate password

  const result = await bcrypt.compare(req.body.password, user.password);
  console.log(result);
  if (!result) {
    throw new AppError(
      "The username or password provided is incorrect",
      401,
      "INVALID_CREDENTIALS"
    );
  }
  const userInfo = {
    username: user.username,
    id: user._id,
  };

  jwt.sign(
    { user: userInfo },
    process.env.SECRETKEY,
    { expiresIn: "3h" },
    (err, token) => {
      if (err) {
        next(err);
      }

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
});

exports.validateUser = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  console.log("verifying user ");

  jwt.verify(token, process.env.SECRETKEY, (err, userData) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "User time out, please log back in" });
    } else {
      return res.json({ success: true, data: userData });
    }
  });
});

exports.postLogout = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
};

exports.postSignUp = [
  body("username", "Must have a username").trim().isLength({ min: 1 }).escape(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must contain 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
    )
    .withMessage(
      "Password should have at least one uppercase letter, one number, and one special character"
    ),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ message: errors });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    if (!hashedPassword) {
      res.status(401).json({ message: "Error signing up" });
    }

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    await newUser.save();

    const userInfo = {
      username: newUser.username,
      id: newUser._id,
    };

    jwt.sign(
      { user: userInfo },
      process.env.SECRETKEY,
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
  },
];
