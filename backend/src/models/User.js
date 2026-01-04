import mongoose from "mongoose";

//Schema for the user model
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    profilImage:{
        type: String,
        default: ""
    }
});

//creating the model using the SChema
const User = mongoose.model("User", userSchema);

export default User;