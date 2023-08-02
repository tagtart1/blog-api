var express = require("express");
const authController = require("../controllers/authController");
var router = express.Router();

// /posts routes

router.post("/login", authController.postLogin);

module.exports = router;
