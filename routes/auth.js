var express = require("express");
const authController = require("../controllers/authController");
var router = express.Router();

// /posts routes

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.post("/sign-up", authController.postSignUp);

router.get("/validate-user", authController.validateUser);

module.exports = router;
