import mongoose from "mongoose";

// Schema for user's authentication
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] }, // Will contain an array of strings of all the tags
  friends: { type: [String] },
  msgRead: { type: [String] }, //will store the ids of the notifications which are read
  newMsg: { type: Number, default: 0 }, //will store the new messages
  avatarIndex: { type: Number, default: -1 }, //will store the index of the avatar
  gender: { type: String },
  notifications: [
    {
      type: { type: String },
      userId: { type: String },
      otherId: { type: String }, //to store any other id
      time: { type: Date, default: Date.now },
    },
  ], // Will store the id of users for friend request
  joinedOn: { type: Date, default: Date.now }, // Date.now - The database will autofill the time
});

export default mongoose.model("User", userSchema);
