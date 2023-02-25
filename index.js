import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

//router
import userRoutes from "./routes/users.js";
import questionRoutes from "./routes/questions.js";
import answerRoutes from "./routes/answers.js";
import commentRoutes from "./routes/comments.js";

const app = express(); // To create an express server

//Using middlewares
app.use(
  express.json({
    limit: "30mb",
    extended: true,
  })
);
app.use(
  express.urlencoded({
    limit: "30mb",
    extended: true,
  })
);
app.use(cors());

// Displaying this text on the screen on local host 5000
app.get("/", (req, res) => {
  res.send("This is a Stack Overflow Clone API made by Sukrit");
});

// If the path is /user/something else then it will use functions in users.js
// If path is /user/signup then it will use that function.
// Requests will get executed according to the path getting matched in users.js
app.use("/user", userRoutes);
app.use("/questions", questionRoutes);
app.use("/answer", answerRoutes);
app.use("/comment", commentRoutes);

dotenv.config(); //to use dotenv variables
const PORT = process.env.PORT || 80;

const DATABASE_URL = process.env.CONNECTION_URL;
mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // listen for a connection with the MongoDB database
    // callback function for which if the app is working sucessfully
    app.listen(PORT, () => {
      console.log(
        // "Sukrit! server running on https://web-production-ebba.up.railway.app"
        "Sukrit! server running on http://localhost:80"
      );
    });
  })
  .catch((err) => {
    // if there is an error connecting with the port
    console.log(err.message);
  });
