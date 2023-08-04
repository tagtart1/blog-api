var express = require("express");
const postController = require("../controllers/postController");
var router = express.Router();
const verifyToken = require("../middleware/verifyToken");

// /posts routes

router.get("/", postController.getPosts);

router.post("/", verifyToken, postController.postPosts);

router.get("/:id", postController.getPostById);

router.delete("/:id", verifyToken, postController.deletePost);

router.patch("/:id", verifyToken, postController.updatePost);

module.exports = router;
