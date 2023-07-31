var express = require("express");
const postController = require("../controllers/postController");
var router = express.Router();

// /posts routes

router.get("/", postController.posts_get);

module.exports = router;
