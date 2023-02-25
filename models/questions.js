import mongoose from "mongoose";

// Schema for user's question details
const questionSchema = mongoose.Schema({
  questionTitle: { type: String, required: "Question must have a title" },
  questionBody: { type: String, required: "Question must have a body" },
  tags: { type: [String], required: "Question must have a tag" },
  noOfAnswers: { type: Number, default: 0 },
  upVote: { type: [String], default: [] }, // will contain a array of userId voting up
  downVote: { type: [String], default: [] }, // will contain a array of userId voting down
  userPosted: { type: String, required: "Question must have an author" },
  userId: { type: String },
  askedOn: { type: Date, default: Date.now },
  answer: [
    {
      anwerBody: String,
      userAnswered: String,
      userId: String,
      answeredOn: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Question", questionSchema);
