const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

// GET all psots
exports.getPosts = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;

  let posts = {};

  if (userId) {
    posts = await Post.find({
      author: userId,
      $or: [{ isDraft: false }, { isDraft: { $exists: false } }],
    })
      .sort({ createdTimestamp: -1 })
      .populate("author", "username");
  } else {
    posts = await Post.find({
      $or: [{ isDraft: false }, { isDraft: { $exists: false } }],
    })
      .sort({ createdTimestamp: -1 })
      .populate("author", "username");
  }

  res.status(200).json({ data: { posts: posts } });
});

// GET specific post
exports.getPostById = asyncHandler(async (req, res) => {
  // Override the cast error
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError("Post not found", 404, "NOT_FOUND");
  }

  // Find post in database
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404, "NOT_FOUND");
  }

  return res.status(200).json({ data: { post: post } });
});

// POST new post
exports.postPosts = [
  body("title", "Must include a title").trim().isLength({ min: 1 }).escape(),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You can't post an empty blog post!")
    .isLength({ max: 1500 })
    .withMessage("That is way too long for a blog post!")
    .escape(),
  asyncHandler(async (req, res) => {
    // Extract errors
    const errors = validationResult(req);

    const newPost = {
      title: req.body.title,
      text: req.body.text,
      isDraft: req.body.isDraft,
    };

    jwt.verify(req.token, process.env.SECRETKEY, (err, authData) => {
      if (err) {
        throw new AppError(
          "Session timed out, pleae sign back in",
          401,
          "TIMED_OUT"
        );
      } else {
        newPost.author = authData.user.id;
      }
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    } else {
      const post = await new Post(newPost).save();

      return res.status(200).json({
        data: post,
      });
    }
  }),
];

// DELETE post
exports.deletePost = asyncHandler(async (req, res) => {
  jwt.verify(req.token, process.env.SECRETKEY, async (err, authData) => {
    if (err) {
      throw new AppError(
        "Session timed out, pleae sign back in",
        401,
        "TIMED_OUT"
      );
    }

    const toDeleteDoc = await Post.findById(req.params.id);
    if (!toDeleteDoc) throw new AppError("Post not found", 404, "NOT_FOUND");

    if (toDeleteDoc.author.toString() !== authData.user.id)
      throw new AppError("Invalid permissions", 403, "INVALID_CREDENTIALS");

    const deleted = await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ data: deleted });
  });
});

// UPDATE psot
exports.updatePost = [
  body("title", "Must include a title").trim().isLength({ min: 1 }).escape(),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You can't post an empty blog post!")
    .isLength({ max: 1500 })
    .withMessage("That is way too long for a blog post!")
    .escape(),
  asyncHandler(async (req, res) => {
    // Extract errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => err.msg);

      throw new AppError(formattedErrors, 400, "VALIDATION_ERROR");
    }

    const update = {
      title: req.body.title,
      text: req.body.text,
      isDraft: req.body.isDraft,
      lastUpdatedTimestamp: Date.now(),
    };

    jwt.verify(req.token, process.env.SECRETKEY, async (err, authData) => {
      if (err) {
        throw new AppError(
          "Session timed out, pleae sign back in",
          401,
          "TIMED_OUT"
        );
      }

      const updatedPostFinal = await Post.findOneAndUpdate(
        { _id: req.params.id, author: authData.user.id },
        update,
        { new: true }
      );

      if (!updatedPostFinal) {
        throw new AppError("Invalid permissions", 403, "INVALID_CREDENTIALS");
      }

      return res.status(200).json({
        data: updatedPostFinal,
      });
    });
  }),
];
