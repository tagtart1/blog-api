// GET all psots

exports.getPosts = (req, res) => {
  res.status(200).json({
    message: "HEY from posts_get",
  });
};
