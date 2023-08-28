const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Post = require("../models/post");
const jwt = require("jsonwebtoken");

// GET all psots
exports.getPosts = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  const onlyDrafts = req.query.only_drafts;
  let posts = {};

  //Should later seperate the concerns of getting a users private posts over the public get all posts api
  if (userId) {
    if (onlyDrafts) {
      posts = await Post.find({ author: userId, isDraft: true })
        .sort({ timestamp: -1 })
        .populate("author", "username");
    } else {
      posts = await Post.find({
        author: userId,
        $or: [{ isDraft: false }, { isDraft: { $exists: false } }],
      })
        .sort({ timestamp: -1 })
        .populate("author", "username");
    }
  } else {
    posts = await Post.find({})
      .sort({ timestamp: -1 })
      .populate("author", "username");
  }

  res.status(200).json(posts);
});

// GET specific post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new Error();
    }

    return res.status(200).json(post);
  } catch {
    return res.status(404).json({ message: "No results found" });
  }
};

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

    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Invalid permissions" });
      } else {
        newPost.author = authData.user.id;
      }
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.mapped() });
    } else {
      const post = await new Post(newPost).save();

      return res.status(200).json({
        post: post,
      });
    }
  }),
];

// DELETE post
exports.deletePost = async (req, res) => {
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      return res.status(403).json({ message: "Invalid permissions" });
    }
    try {
      const toDeleteDoc = await Post.findById(req.params.id);
      if (!toDeleteDoc)
        return res.status(404).json({ err: "Post does not exist" });

      if (toDeleteDoc.author.toString() !== authData.user.id)
        return res.status(403).json({ err: "Cannot delete post" });

      const deleted = await Post.findByIdAndDelete(req.params.id);
      res.status(200).json(deleted);
    } catch {
      res.status(400).json({ err: "Post does not exist" });
    }
  });
};

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
      return res.status(400).json({ errors: errors.mapped() });
    }

    const update = {
      title: req.body.title,
      text: req.body.text,
    };

    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Invalid permissions" });
      }

      const updatedPostFinal = await Post.findOneAndUpdate(
        { _id: req.params.id, author: authData.user.id },
        update,
        { new: true }
      );

      if (!updatedPostFinal) {
        return res
          .status(403)
          .json({ message: "You cannot edit some one else's post!" });
      }

      return res.status(200).json({
        post: updatedPostFinal,
      });
    });
  }),
];
