import mongoose from "mongoose";

//schema
import Questions from "../models/questions.js";

//ask question
export const AskQuestion = async (req, res) => {
  const postQuestionData = req.body; // It will request the question details from the body
  // Creating an object of the questions model
  // Taking the question's data from the frontend and pass that value into the schema
  const postQuestion = new Questions(postQuestionData);
  try {
    await postQuestion.save(); //saving the data in the mongodb
    res.status(200).json("Question Posted Successfully");
  } catch (error) {
    console.log("error");
    res.status(409).json("Couldn't post the question");
  }
};

// Fetching the question details from the databse and sending it to frontend
export const getAllQuestions = async (req, res) => {
  try {
    const questionList = await Questions.find(); // to find all the records from Questions schema stored in database
    res.status(200).json(questionList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete question
export const deleteQuestion = async (req, res) => {
  const { id: _id } = req.params; // params available in the url which is :id as mentioned in the routes
  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).send("Question is unavailable");
  }
  try {
    //in the database it will find the id which matches _id and remove it
    await Questions.findByIdAndRemove(_id);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//vote question
export const voteQuestion = async (req, res) => {
  const { id: _id } = req.params; // requesting the id present in the url as a parameter
  const { value, userId } = req.body;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question is unavailable");
  }
  try {
    const question = await Questions.findById(_id); //will find the question in the databse matching this id
    /*'findIndex' is similar to forEach loop where it is itering to every string inside the array upVote.
      If that string is equal to the userId (user who has sent a request to upVote), then it will return an index >= 0.
     */
    const upIndex = question.upVote.findIndex((id) => id === String(userId));
    const downIndex = question.downVote.findIndex(
      (id) => id === String(userId)
    );

    if (value === "upVote") {
      // downIndex = -1 means user's id is not present in downVote array
      // they can down vote
      if (downIndex !== -1) {
        //If they have already down voted and then again they click down vote then vote has to be reseted.
        // Which means we have to remove user's id from the downVote array.
        // filtering out userId which is present in the array
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
      }
      //If upIndex = -1 then, add that user's id in the upVote array using push() of Stack in upVote array.
      if (upIndex === -1) {
        question.upVote.push(userId);
      } else {
        //If user has already upVoted then remove user's id from upVote array.
        //neutral state
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
    } else if (value === "downVote") {
      if (upIndex !== -1) {
        //If user already up voted then remove his user id from upVote array as he chose to downVote.
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
      if (downIndex === -1) {
        //If user's id is not there in downVote array then add his name to the array.
        question.downVote.push(userId);
      } else {
        //If user's id is present in the downVote array and he clicked downVote again, then remove his user id from downVote array.
        //neutral state
        question.downVote = question.downVote.filter(
          (id) => id !== String(userId)
        );
      }
    }
    //Replace/update the question item in the database with the new question after performing upVote and downVote.
    await Questions.findByIdAndUpdate(_id, question);
    res.status(200).json({ message: "Voted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Id not found" });
  }
};
