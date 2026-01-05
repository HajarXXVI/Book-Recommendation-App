import jwt from "jsonwebtoken";
import User from "../models/User.js";


// Example of how the protectRoute middleware is used in routes:
// const response = await fetch(`http://localhost:3000/api/books`, {
//   method: "POST",
//   body: JSON.stringify({
//     title,
//     caption
//   }),
//   headers: { Authorization: `Bearer ${token}` },
// });


const protectRoute = async (req, res, next) => {
  try {
    // get token from header
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No authentication token, access denied" });

    // verify token, the token is coded so we need to decode it to get the user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user by id and attach to req object
    const user = await User.findById(decoded.userId).select("-password"); //ensures the password doesn’t get attached to req.user or sent accidentally
    
    if (!user) return res.status(401).json({ message: "Token is not valid" }); 
    
    // attach user to req object
    req.user = user;

    // proceed to the next middleware or route handler (next function)
    next();
    
  } catch (error) {
    console.error("Authentication error: ", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protectRoute;