import express from "express";
import User from "../models/User.js";

const router = express.Router();

//Endpoints
router.post("/register", async (req, res) => {
    try {
        const {username, email, password} = req.body

        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"}); //400 = error
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password should be at least 6 characters long"});
        }

        if(username.length){
            return res.status(400).json({message: "Username should be at least 3 characters long"});
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
        

        //creating the user
        const user = new User({
            email,
            username,
            password,
            profilImage:"",
        })

    } catch (error) {
        
    }
});

router.post("/login", async (req, res) => {
    res.send("login");
});

export default router;