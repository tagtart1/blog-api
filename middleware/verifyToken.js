// Verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    req.token = token;
    next();
  } else {
    // Can send custom message later
    res.status(403).json({
      message: "Failed to authorize token",
    });
  }
};

module.exports = verifyToken;
