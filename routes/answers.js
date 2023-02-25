import express from "express";

//controllers
import { deleteAnswer, postAnswer } from "../controllers/answers.js";

//middlewares
import auth from "../middlewares/auth.js";

const router = express.Router(); //creating a router of express

//using patch() instead of post() because we are not going to create a new record in the databse when a question is answered.
//We'll just update the answer item in the database of that particular question.
//:id to pass the id of the question from the frontend
//passing the id as a parameter
router.patch("/post/:id", auth, postAnswer); //to update the databse

//to delete an answer with a specific id
/* We are using patch() request instead of delete() request because
   we dont want to delete the entire answer object in the database.
   There are multiple answers in the 'answer' object but we want
   to delete only one answer. So we are going to patch the database
   with the updated answer.
 */
router.patch("/delete/:id", auth, deleteAnswer);
export default router;
