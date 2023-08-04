const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");
const jwt = require("jsonwebtoken");

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ parentPost: req.params.postId });

  res.status(200).json(comments);
  l;
});

exports.postComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Add your comment to post")
    .isLength({ max: 1000 })
    .withMessage("Comment too long")
    .escape(),
  body("author")
    .trim()
    .notEmpty()
    .withMessage("Must enter an author")
    .isLength({ max: 100 })
    .withMessage("Author name too long")
    .escape(),
  asyncHandler(async (req, res) => {
    // Extract errors
    const errors = validationResult(req);

    const comment = {
      author: req.body.author,
      text: req.body.text,
    };
  }),
];

exports.deleteComment = (req, res) => {
  res.send("WIP");
};

exports.updateComment = (req, res) => {
  res.send("WIP");
};
