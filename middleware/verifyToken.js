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

module.exports = verifyToken;
