import express from "express";
//middlewares
import auth from "../middlewares/auth.js";
import {
  getAllComments,
  postComment,
  voteComment,
} from "../controllers/comments.js";

const router = express.Router(); //creating a router of express

router.post("/post", auth, postComment);
router.get("/get", getAllComments);
router.patch("/vote", auth, voteComment);

export default router;
