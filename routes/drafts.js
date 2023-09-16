var express = require("express");
const draftController = require("../controllers/draftController");
var router = express.Router();
const verifyToken = require("../middleware/verifyToken");

// /posts routes

router.get("/", verifyToken, draftController.getDrafts);

module.exports = router;
