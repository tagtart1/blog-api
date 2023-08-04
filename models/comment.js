const moment = require("moment");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String },
  timestamp: { type: Date, default: Date.now() },
  author: { type: String },
  parentPost: { type: Schema.Types.ObjectId, ref: "Post" },
});

CommentSchema.virtual("formattedDate").get(function () {
  return moment(this.timestamp).format("MMM Do, YYYY");
});

module.exports = mongoose.model("Comment", CommentSchema);
