var express = require("express");
const postController = require("../controllers/postController");
var router = express.Router();

// Verify token
const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    // Get token
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;

    next();
  } else {
    // Can send custom message later
    res.sendStatus(403);
  }
};

// /posts routes

router.get("/", postController.getPosts);

router.post("/", verifyToken, postController.postPosts);

router.get("/:id", postController.getPostById);

router.delete("/:id", verifyToken, postController.deletePost);

router.patch("/:id", verifyToken, postController.updatePost);

module.exports = router;
