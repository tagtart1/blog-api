const Post = require("../models/post");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/appError");

// GET drafts
exports.getDrafts = asyncHandler(async (req, res) => {
  jwt.verify(req.token, process.env.SECRETKEY, async (err, authData) => {
    if (err) {
      throw new AppError(
        "Session timed out, pleae sign back in",
        401,
        "TIMED_OUT"
      );
    }

    const posts = await Post.find({ author: authData.user.id, isDraft: true })
      .sort({ createdTimestamp: -1 })
      .populate("author", "username");

    return res.status(200).json({ data: posts });
  });
});
