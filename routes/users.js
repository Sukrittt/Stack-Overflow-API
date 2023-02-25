import express from "express";

//controllers
import { signup, login } from "../controllers/auth.js";
import {
  addFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getAllUsers,
  updateProfile,
  getUpdatedUser,
  sendNotifyType,
  markAsRead,
  updateUserNotification,
} from "../controllers/users.js";

//middlewares
import auth from "../middlewares/auth.js";

const router = express.Router();

// Setting up functions for different paths importing from controllers
router.post("/signup", signup); // If request is a signup request
router.post("/login", login); // If request is a login request

//to get the names of all the user who have registered in the website
router.get("/getAllUsers", getAllUsers);

//to store user details
router.patch("/update/:id", auth, updateProfile); //will send a patch request to the databse to update the user details

//to store the id of the user who made friend request
router.patch("/addfriendrequest", auth, addFriendRequest);
router.patch("/acceptfriendrequest", auth, acceptFriendRequest);
router.patch("/sendtype", auth, sendNotifyType);
router.patch("/declinefriendrequest", auth, declineFriendRequest);
router.patch("/deletefriend", auth, deleteFriend);
router.patch("/markasread/:id", auth, markAsRead);
router.patch("/updatenotification/:id", auth, updateUserNotification);
router.get("/updatedUser/:id", auth, getUpdatedUser);

export default router;
