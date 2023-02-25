import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  try {
    //will request the token stored in the header
    // [1] because we are selecting the 2nd element
    const token = req.headers.authorization.split(" ")[1];
    //jwt will verify the token with secret which we initialised while signing the jwt token
    let decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodeData?.id;
    next(); // next means it will allow the next function to execute
  } catch (error) {
    console.log(error);
    next({ status: 401, message: "JWT token expired." });
  }
};

export default auth;
