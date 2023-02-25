import mongoose from "mongoose";

//schema
import questions from "../models/questions.js";
import users from "../models/auth.js";

export const postAnswer = async (req, res) => {
  //note: everything comes in 'params' except the domain name
  const { id: _id } = req.params; //the id present in the parameter in the url
  const { noOfAnswers, anwerBody, userAnswered, userId } = req.body; // requesting these data from the database

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question is unavailable");
  }
  updateNoOfAnswers(_id, noOfAnswers);

  try {
    //will find the question by id and update it
    // '$addToSet' means I want to add a an object in the array "answer" in the database
    const updatedQuestion = await questions.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ anwerBody, userAnswered, userId }] },
    });

    //sending notifications to user
    const questionSchema = await questions.findById(_id);
    //finding the user and updating their notification with the question's id so that they can visit the question which was answered.

    await users.findByIdAndUpdate(questionSchema.userId, {
      $addToSet: {
        notifications: [{ type: "ANSWERED", otherId: _id, userId: userId }],
      },
      $inc: { newMsg: 1 }, //$inc to increment the value by 1
    });

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Could not post answer", message: error.message });
  }
};

/*Note:
'$addToSet' property adds to the value, which means it will add another object to the answer array
'$set' property just re-assigns the number of answers in the database
*/
//to update the number of answers in the database
const updateNoOfAnswers = async (_id, noOfAnswers) => {
  try {
    await questions.findByIdAndUpdate(_id, {
      $set: {
        noOfAnswers: noOfAnswers,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

//To delete an answer with a specific id
export const deleteAnswer = async (req, res) => {
  const { id: _id } = req.params; //this is the id of the questions where the answer is residing
  const { answerId, noOfAnswers } = req.body; // will request answerId and noOfAnswers from the frontend
  //checking if the question id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question is unavailable");
  }
  //checking if the answer id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(404).send("Answer is unavailable");
  }
  updateNoOfAnswers(_id, noOfAnswers);
  try {
    await questions.updateOne(
      { _id },
      //$pull is used to pull a specific id from 'answer' in the database
      { $pull: { answer: { _id: answerId } } }
    );
    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(405).json(error);
  }
};
