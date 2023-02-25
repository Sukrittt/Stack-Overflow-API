import mongoose from "mongoose";

//schema
import users from "../models/auth.js";
import Comments from "../models/comment.js";

export const postComment = async (req, res) => {
  const postCommentData = req.body; // It will request the comment details from the body
  // Creating an object of the comments model
  // Taking the comment's data from the frontend and pass that value into the schema
  const postComment = new Comments(postCommentData);
  try {
    await postComment.save(); //saving the data in the mongodb
    res.status(200).json("Comment Posted Successfully");
  } catch (error) {
    console.log("error");
    res.status(409).json("Couldn't post the comment");
  }
};

export const getAllComments = async (req, res) => {
  try {
    const commentList = await Comments.find(); // find everything in the database
    res.status(200).json(commentList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const voteComment = async (req, res) => {
  const { value, userId, commentId } = req.body;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).send("Comment is unavailable");
  }
  try {
    //will find the comment which matches the comment id
    const comment = await Comments.findById(commentId);

    //finding if user has already liked the comment
    const upIndex = comment.noOfLikes.findIndex((id) => id === String(userId));

    //finding if user has already disliked the comment
    const downIndex = comment.noOfDislikes.findIndex(
      (id) => id === String(userId)
    );
    let displayNotification = true;
    //value will be either 'like' or 'dislike'
    if (value === "like") {
      //like request
      if (downIndex !== -1) {
        //remove the user's id from the dislikes array
        comment.noOfDislikes = comment.noOfDislikes.filter(
          (id) => id !== String(userId)
        );
      }
      if (upIndex === -1) {
        comment.noOfLikes.push(userId);
      } else {
        //notification not to be displayed for this condition.
        displayNotification = false;
        comment.noOfLikes = comment.noOfLikes.filter(
          (id) => id !== String(userId)
        );
      }
    } else if (value === "dislike") {
      //dislike request
      if (upIndex !== -1) {
        comment.noOfLikes = comment.noOfLikes.filter(
          (id) => id !== String(userId)
        );
      }
      if (downIndex === -1) {
        comment.noOfDislikes.push(userId);
      } else {
        //notification not to be displayed for this condition.
        displayNotification = false;
        comment.noOfDislikes = comment.noOfDislikes.filter(
          (id) => id !== String(userId)
        );
      }
    }

    if (displayNotification) {
      //sending notification to the user who commented that someone liked your comment.
      //find the user by it's id and sending notification to them
      await users.findByIdAndUpdate(comment.userId, {
        $addToSet: { notifications: [{ type: value, userId: userId }] },
      });
    }

    await Comments.findByIdAndUpdate(commentId, comment);
    res.status(200).json({ message: "Voted Sucessfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
