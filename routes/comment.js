const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/", commentController.getComments);

router.post("/", commentController.postComment);

router.delete("/:commentId", commentController.deleteComment);

router.patch("/:commentId", commentController.updateComment);

module.exports = router;
