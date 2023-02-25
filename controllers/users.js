import mongoose from "mongoose";

import users from "../models/auth.js";

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.find(); //get all the data from the database
    const allUserDetails = [];
    //looping through each element of allUsers
    // pusing an object for each user in 'allUserDetails'
    allUsers.forEach((user) => {
      allUserDetails.push({
        _id: user._id,
        about: user.about,
        name: user.name,
        tags: user.tags,
        friends: user.friends,
        avatarIndex: user.avatarIndex,
        gender: user.gender,
        joinedOn: user.joinedOn,
      });
    });
    res.status(200).json(allUserDetails);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { id: _id } = req.params; //to get the id in the url
  const { name, about, newTags, avatarIndex } = req.body;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("User is unavailable");
  }
  try {
    /*Finding the user with that specific id and then updating it in the database.
      Using the '$set' property to re-assign name, about and tags recieved from the frontend.
      'new:true' is used to indicate that the updated profile has to be sent as a response.
      If it is not mentioned then it will send the record before updating the profile.
      Note: The database will be updated but the response will be containing old details
            if it is not mentioned.
    */
    const updatedProfile = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          name: name,
          about: about,
          tags: newTags,
          avatarIndex: avatarIndex,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedProfile); //send updated profile to the frontend
  } catch (error) {
    res.status(405).json({ message: error.message });
  }
};

//add friend request
export const addFriendRequest = async (req, res) => {
  const { sentBy, sentTo } = req.body;

  // Validate user id
  if (!mongoose.Types.ObjectId.isValid(sentBy)) {
    return res.status(400).json({ message: "Invalid sender id" });
  }
  if (!mongoose.Types.ObjectId.isValid(sentTo)) {
    return res.status(400).json({ message: "Invalid receiver id" });
  }

  try {
    const sentType = "SENT";
    const receiveType = "RECEIVED";

    // Find sender in the database
    const sentByUserSchema = await users.findById(sentBy);
    const sentToUserSchema = await users.findById(sentTo);

    //finding if the user id of the receiver is already present in the notifications object and checking if there is already a notification of type 'sent'
    const indexBy = sentByUserSchema.notifications.findIndex(
      (notification) =>
        notification.userId === String(sentTo) && notification.type === "SENT"
    );
    const indexTo = sentToUserSchema.notifications.findIndex(
      (notification) =>
        notification.userId === String(sentBy) &&
        notification.type === "RECEIVED"
    );

    //if receiver's user id with the type of 'sent' is already present then friend request already sent.
    //if both of them have same index
    if (indexBy >= 0 || indexTo >= 0) {
      return res.status(201).json({ message: "Friend request pending." });
    }

    //finding if user is already a friend or not
    const indexUser = sentByUserSchema.friends.findIndex(
      (userId) => userId === String(sentTo)
    );
    if (indexUser >= 0) {
      return res.status(400).json({ message: "User is already your friend." });
    }

    //Update sender and receiver with friend request information
    const sentByUser = await users.findByIdAndUpdate(sentBy, {
      $addToSet: { notifications: [{ type: sentType, userId: sentTo }] },
      $inc: { newMsg: 1 }, //$inc to increment the value by 1
    });
    const sentToUser = await users.findByIdAndUpdate(sentTo, {
      $addToSet: { notifications: [{ type: receiveType, userId: sentBy }] },
      $inc: { newMsg: 1 }, //$inc to increment the value by 1
    });

    res.status(200).json({ sentToUser, sentByUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error processing friend request.",
      error: error.message,
    });
  }
};

//accept friend request
export const acceptFriendRequest = async (req, res) => {
  const { sentBy, sentTo } = req.body;

  //checking if user id is a valid id or not
  if (
    !mongoose.Types.ObjectId.isValid(sentBy) ||
    !mongoose.Types.ObjectId.isValid(sentTo)
  ) {
    return res.status(404).send("User not found.");
  }
  try {
    //Retrieving data of both the users
    const sentByUserSchema = await users.findById(sentBy);
    const sentToUserSchema = await users.findById(sentTo);

    //finding if the user id of the receiver is present or not and checking if there is already a notification of type 'RECEIVED'
    const index = sentByUserSchema.notifications.findIndex(
      (notification) =>
        notification.userId === String(sentTo) &&
        notification.type === "RECEIVED"
    );

    //if receiver's user id with the type of 'RECEIVED' is already present then friend request already sent.
    //if both of them have same index
    if (index < 0) {
      return res.status(201).json({ message: "Friend request not found." });
    }

    //Removing data from notification array
    //user who is accepting the friend request
    const notifyBy = sentByUserSchema.notifications.find(
      //finding the object that is to be deleted
      (obj) => obj.userId === String(sentTo) && obj.type === "RECEIVED"
    );
    const indexOfNotifyBy = sentByUserSchema.notifications.indexOf(notifyBy); //finding the index of that object

    sentByUserSchema.notifications.splice(indexOfNotifyBy, 1); //deleting the object
    sentByUserSchema.newMsg -= 1;

    //user whose friend request is being accepted
    const notifyTo = sentToUserSchema.notifications.find(
      //finding the object that is to be deleted
      (obj) => obj.userId === String(sentBy) && obj.type === "SENT"
    );
    const indexOfNotifyTo = sentToUserSchema.notifications.indexOf(notifyTo); //finding the index of that object
    sentToUserSchema.notifications.splice(indexOfNotifyTo, 1); //deleting the object

    //Adding data in the friends array
    const indexFriend = sentByUserSchema.friends.findIndex(
      (id) => id === String(sentTo)
    );
    if (indexFriend >= 0) {
      return res.status(400).json({ message: "User is already your friend" });
    }
    //adding the user ids in the friend list
    sentByUserSchema.friends.push(sentTo);
    sentToUserSchema.friends.push(sentBy);

    //finding the two users and updating their schema
    await users.findByIdAndUpdate(sentBy, sentByUserSchema);
    await users.findByIdAndUpdate(sentTo, sentToUserSchema);

    res.status(200).json({ message: "Friend request accepted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Error in accepting friend request.",
      error: error.message,
    });
  }
};

//update user notification
export const updateUserNotification = async (req, res) => {
  const { id: _id } = req.params;
  const { msgRead } = req.body;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("User not found");
  }

  try {
    const userSchema = await users.findById(_id);
    if (userSchema.msgRead.length === 0) return;

    const newMsgCount = msgRead.reduce((acc, id) => {
      if (!userSchema.msgRead.includes(id)) {
        return acc + 1;
      }
      return acc;
    }, 0);

    userSchema.newMsg = newMsgCount; //updating notification count

    //finding the user and updating their schema
    await users.findByIdAndUpdate(_id, userSchema);
    res.status(200).json("Read all messages successfully.");
  } catch (error) {
    res.status(400).json({
      message: "Error updating notifications",
      message: error.message,
    });
  }
};

//to send notification type
export const sendNotifyType = async (req, res) => {
  const { sentBy, sentTo, type } = req.body;

  //checking if user id is a valid id or not
  if (
    !mongoose.Types.ObjectId.isValid(sentBy) ||
    !mongoose.Types.ObjectId.isValid(sentTo)
  ) {
    return res.status(404).send("User not found.");
  }

  const sentToUserSchema = await users.findByIdAndUpdate(sentTo, {
    $addToSet: { notifications: [{ type: type, userId: sentBy }] },
  });

  await users.findByIdAndUpdate(sentTo, sentToUserSchema);
  res.status(200).json({ message: "Notification updated successfully." });
};

//decline friend request
export const declineFriendRequest = async (req, res) => {
  const { sentBy, sentTo } = req.body;

  //checking if user id is a valid id or not
  if (
    !mongoose.Types.ObjectId.isValid(sentBy) ||
    !mongoose.Types.ObjectId.isValid(sentTo)
  ) {
    return res.status(404).send("User not found.");
  }
  try {
    //Retrieving data of both the users
    const sentByUserSchema = await users.findById(sentBy);
    const sentToUserSchema = await users.findById(sentTo);

    //Removing data from notification array
    //user who is declining the friend request
    const notifyBy = sentByUserSchema.notifications.find(
      //finding the object that is to be deleted
      (obj) => obj.userId === String(sentTo) && obj.type === "RECEIVED"
    );

    const indexOfNotifyBy = sentByUserSchema.notifications.indexOf(notifyBy); //finding the index of that object
    sentByUserSchema.notifications.splice(indexOfNotifyBy, 1); //deleting the object
    sentByUserSchema.newMsg -= 1;

    //user whose friend request is being declined
    const notifyTo = sentToUserSchema.notifications.find(
      //finding the object that is to be deleted
      (obj) => obj.userId === String(sentBy) && obj.type === "SENT"
    );
    const indexOfNotifyTo = sentToUserSchema.notifications.indexOf(notifyTo); //finding the index of that object
    sentToUserSchema.notifications.splice(indexOfNotifyTo, 1); //deleting the object

    //finding the two users and updating their schema
    await users.findByIdAndUpdate(sentBy, sentByUserSchema);
    await users.findByIdAndUpdate(sentTo, sentToUserSchema);

    res.status(200).json({ message: "Friend request declined successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Error in declining friend request.",
      error: error.message,
    });
  }
};

//add friend
export const addFriend = async (req, res) => {
  const { sentBy, sentTo } = req.body;

  //checking if user id is a valid id or not
  if (
    !mongoose.Types.ObjectId.isValid(sentBy) ||
    !mongoose.Types.ObjectId.isValid(sentTo)
  ) {
    return res.status(404).send("User not found");
  }

  try {
    const sentByUser = await users.findById(sentBy); //will contain the schema of the user who sent friend request
    const sentToUser = await users.findById(sentTo); //will contain the schema of the user who received friend request

    const index = sentByUser.friends.findIndex((id) => id === String(sentTo));
    if (index >= 0) {
      return res.status(400).json({ message: "User is already your friend" });
    }

    //adding the user ids in the friend list
    sentByUser.friends.push(sentTo);
    sentToUser.friends.push(sentBy);

    //finding the two users and updating their schema
    await users.findByIdAndUpdate(sentBy, sentByUser);
    await users.findByIdAndUpdate(sentTo, sentToUser);

    res.status(200).json({ message: "Made a Friend" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//delete friend
export const deleteFriend = async (req, res) => {
  const { sentBy, sentTo } = req.body;

  //checking if user id is a valid id or not
  if (
    !mongoose.Types.ObjectId.isValid(sentBy) ||
    !mongoose.Types.ObjectId.isValid(sentTo)
  ) {
    return res.status(404).send("User not found");
  }

  try {
    const sentByUser = await users.findById(sentBy); //will contain the schema of the user who sent friend request
    const sentToUser = await users.findById(sentTo); //will contain the schema of the user who received friend request

    //If 'sentByUser' sends a delete friend request then remove the friend id from both 'sentByUser' and 'sentToUser'.
    //Checking if the user's id is present in the other user's friend's id
    const index = sentByUser.friends.findIndex((id) => id === String(sentTo));

    if (index < 0) {
      return res.status(400).json({ message: "User is not your friend" });
    }

    //filter out the ids which is equal to 'sentTo' and 'sentBy'
    sentByUser.friends = sentByUser.friends.filter((id) => id !== sentTo);
    sentToUser.friends = sentToUser.friends.filter((id) => id !== sentBy);

    //finding the two users and updating their schema
    await users.findByIdAndUpdate(sentBy, sentByUser);
    await users.findByIdAndUpdate(sentTo, sentToUser);

    res.status(200).json({ message: "Deleted a friend" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//to update the number of messages ready by the user
export const markAsRead = async (req, res) => {
  const { id: _id } = req.params;
  const { msgRead } = req.body;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("User not found");
  }

  try {
    const userSchema = await users.findById(_id);

    userSchema.newMsg = 0;
    userSchema.msgRead = msgRead; //setting msgRead as the array of notifications read

    //finding the user and updating their schema
    await users.findByIdAndUpdate(_id, userSchema);
    res.status(200).json("Read all messages successfully.");
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error reading messages", message: error.message });
  }
};

//to get the updated user
//which basically will retrieve the updated friend details of the user who is logged in.
export const getUpdatedUser = async (req, res) => {
  const { id: _id } = req.params;

  //checking if the id is a valid id or not
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("User not found");
  }
  try {
    const updatedUser = await users.findById(_id);
    //will get the user details and sent it
    res.status(200).json({ result: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
