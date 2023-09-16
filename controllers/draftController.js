const Post = require("../models/post");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// GET drafts
exports.getDrafts = asyncHandler(async (req, res) => {
  jwt.verify(req.token, process.env.SECRETKEY, async (err, authData) => {
    if (err) {
      return res.status(403).json({ message: "Invalid permisions" });
    }
    try {
      const posts = await Post.find({ author: authData.user.id, isDraft: true })
        .sort({ createdTimestamp: -1 })
        .populate("author", "username");

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });
});
