import express from "express";

//controllers
import {
  AskQuestion,
  getAllQuestions,
  deleteQuestion,
  voteQuestion,
} from "../controllers/Questions.js";

//middlewares
import auth from "../middlewares/auth.js";

const router = express.Router();

//If the 'auth' function is satisfied then only user gets to ask, delete and vote.

//This post request will be used to ask a question.
//AskQuestion function will be called when this request is initiated.
router.post("/Ask", auth, AskQuestion); // To send data to the database
router.get("/get", getAllQuestions); // To retrieve data from the database

// To delete the question from the database.
// Will recieve the id as a parameter using useParams()
router.delete("/delete/:id", auth, deleteQuestion);
router.patch("/vote/:id", auth, voteQuestion); //voting

export default router;
