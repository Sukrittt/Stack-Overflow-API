import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

//models
import users from "../models/auth.js";

// Function called for signup
export const signup = async (req, res) => {
  const { name, email, password, avatarIndex, gender } = req.body; // It will request name, email and password from the database
  try {
    const existingUser = await users.findOne({ email }); // To find only one user with the email stored in the database
    if (existingUser) {
      // If user exists then show this message
      return res.status(409).json({ message: "User already exists." });
    }

    // To hash the plain text password and add salt of length 12 before the hased password
    const hashedPassword = await bcrypt.hash(password, 12);

    // To create a new user and store it in a database
    const newUser = await users.create({
      name,
      email,
      avatarIndex,
      gender,
      password: hashedPassword, // passing hashed password in the database
    });

    //Creating jwt tokens
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ result: newUser, token }); // Successful
  } catch (error) {
    // If try block does not work
    res.status(500).json("Something went wrong..."); // Internal server error
  }
};

// Function called for login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await users.findOne({ email }); // It will request name, email and password from the database
    if (!existingUser) {
      // If user's email does not exist in the database then show this message
      return res.status(404).json({ message: "User not found" });
    }

    //Comparing the plain text password entered by the user with the hashed password stored in the database of that particular user
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};
