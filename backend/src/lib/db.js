import mongoose from "mongoose";

export const connectDB = async () => { //async to retrieve the database
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected ${conn.connection.host}`);
    }catch(error){
        console.log(`Error connecting to the database `, error);
        process.exit(1); //exit with failure otherwise if it's 0 then it's connected (success) but in the catch block it wont catch it
    }
}