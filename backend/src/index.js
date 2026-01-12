import express from "express";
import "dotenv/config"; //to access the env variables
import authRoutes from "./routes/authRoutes.js"; //we are useing type modules so we need to add the type (.js)
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";

const app = express();
//in case it wasn't found, we set it to 3000
const PORT = process.env.PORT || 3000;

//allows to parse the json data 
app.use(express.json());
app.use(cors()); //to allow cross origin requests from the frontend (react native app)

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

//here we are using nodemon because each time we make changes it will automatically restarted
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})
