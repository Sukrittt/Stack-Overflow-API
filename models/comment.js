import mongoose from "mongoose";

// Schema for user's comments
const commentSchema = mongoose.Schema({
  msg: { type: String, required: "There must be a comment" },
  userPosted: { type: String, required: "There must be a user" },
  userId: { type: String },
  noOfLikes: { type: [String], default: [] },
  noOfDislikes: { type: [String], default: [] },
  postedOn: { type: Date, default: Date.now },
});

export default mongoose.model("Comments", commentSchema);
