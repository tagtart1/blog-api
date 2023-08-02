var express = require("express");
const postController = require("../controllers/postController");
var router = express.Router();

// /posts routes

router.get("/", postController.getPosts);

router.post("/", postController.postPosts);

module.exports = router;
