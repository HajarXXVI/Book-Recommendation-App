import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

//hash the password before savin it to the database
userSchema.pre("save", async function name(next) {
    //to not hash the password each time this is executed => user.save() for example if we updated the profil picture 
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    //go to the next method => user.save()
    next();
})

//creating the model using the SChema
const User = mongoose.model("User", userSchema);

export default User;