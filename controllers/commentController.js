const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");
const Post = require("../models/post");
const jwt = require("jsonwebtoken");

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ parentPost: req.params.postId });

  if (comments.length === 0) {
    return res.status(404).json({
      message: "No comments yet",
    });
  }

  res.status(200).json(comments);
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
      parentPost: req.params.postId,
    };

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    } else {
      const newComment = await new Comment(comment).save();

      return res.status(200).json({
        comment: newComment,
      });
    }
  }),
];

exports.deleteComment = async (req, res) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      return res.status(403).json({ message: "Invalid permissions" });
    }

    try {
      const parentPost = await Post.findById(req.params.postId);

      // Ensure comment exists
      if (parentPost.author.toString() !== authData.user.id.toString()) {
        return res.status(403).json({
          message: "You can only delete comments under your own posts1",
        });
      }

      const deletedComment = await Comment.findByIdAndDelete(
        req.params.commentId
      );

      if (!deletedComment) {
        return res.status(403).json({
          message: "You can only delete comments under your own posts2",
        });
      }

      res.status(200).json({
        comment: deletedComment,
      });
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  });
};

exports.updateComment = (req, res) => {
  res.send("WIP");
};
