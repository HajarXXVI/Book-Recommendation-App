import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

//generating the token (jwt token used to avoid hitting the db each request)
const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
}

//Register endpoint //this is sent as /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const {email, username, password} = req.body

        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"}); //400 = error
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password should be at least 6 characters long"});
        }

        if(username.length < 5){
            return res.status(400).json({message: "Username should be at least 5 characters long"});
        }

        //checking if the user already exists
        // const existingUSer = await User.findOne({$or:[{email}, {username}]});
        // if(existingUSer) return res.status(400).json({message: "User already exists"});

        //better checking each field on its own
        const existingEmail = await User.findOne({email});
        if(existingEmail) return res.status(400).json({message: "Email already exists"});

        const existingUsername = await User.findOne({username});
        if(existingUsername) return res.status(400).json({message: "Username already exists"});

        
        //getting a random avatar for the profil Image
        const profilImage = `https://api.dicebear.com/9.x/micah/svg?seed=${username}`;

        //creating the user
        const user = new User({
            email,
            username,
            password,
            profileImage: profilImage,
        });

        //then saving the user
        await user.save();

        //creating te Token
        const token = generateToken(user._id);
       
        //201 => ressource has been created
        res.status(201).json({
            token,
            user: { //we specify to not send the user password too
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });

    } catch (error) {
        console.log("Error in register route ", error);
        res.status(500).json({message: "Internal server error"});
    }
});


//login endpoint //this is sent as /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;