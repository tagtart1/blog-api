const User = require("../models/user");
const AppError = require("../utils/appError");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// LOG IN POST
exports.postLogin = asyncHandler(async (req, res, next) => {
  if (!req.body.password || !req.body.username) {
    throw new AppError(
      "The username or password provided is incorrect",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // Find user by username
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    throw new AppError(
      "The username or password provided is incorrect",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // Authenticate password
  const result = await bcrypt.compare(req.body.password, user.password);

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
        data: userInfo,
      });
    }
  );
});

// VALIDATE USER ENSURES THE TOKEN IS VALID AND RETURNS THE userData
exports.validateUser = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.SECRETKEY, (err, userData) => {
    if (err) {
      throw new AppError(
        "User timed out, please log back in",
        401,
        "TIMED_OUT"
      );
    } else {
      return res.json({ data: userData });
    }
  });
});

exports.postLogout = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ data: { message: "Logged out successfully" } });
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
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => err.msg);

      throw new AppError(formattedErrors, 400, "VALIDATION_ERROR");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

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
        if (err) return next(err);

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 10800000,
          path: "/",
        });

        res.json({
          data: userInfo,
        });
      }
    );
  }),
];
