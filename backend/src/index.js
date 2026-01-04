import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js"; //we are useing type modules so we need to add the type (.js)
import { connectDB } from "./lib/db.js";

const app = express();
//in case it wasn't found, we set it to 3000
const PORT = process.env.PORT || 3000;

//allows to parse the json data 
app.use(express.json());

//routes
app.use("/api/auth", authRoutes);

//here we are using nodemon because each time we make changes it will automatically restarted
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})