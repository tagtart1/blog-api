const moment = require("moment");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String },
  text: { type: String },
  timestamp: { type: Date, default: Date.now() },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  isDraft: { type: Boolean },
});

PostSchema.virtual("formattedDate").get(function () {
  return moment(this.timestamp).format("MMM Do, YYYY");
});

module.exports = mongoose.model("Post", PostSchema);
