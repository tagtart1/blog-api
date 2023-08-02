const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Post = require("../models/post");

// GET all psots
exports.getPosts = (req, res) => {
  res.status(200).json({
    message: "HEY from posts_get",
  });
};

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

    const newPost = new Post({
      title: req.body.title,
      text: req.body.text,
      author: "testID",
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    } else {
      await newPost.save();

      return res.status(200).json({
        post: newPost,
      });
    }
  }),
];
