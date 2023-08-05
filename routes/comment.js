const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", commentController.getComments);

router.post("/", commentController.postComment);

router.delete("/:commentId", verifyToken, commentController.deleteComment);

router.patch("/:commentId", commentController.updateComment);

module.exports = router;
