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
app.use(express.json({ limit: "50mb" }));


app.use(cors()); //to allow cross origin requests from the frontend (react native app)

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    // Check if it's a payload too large error
    if (err.type === 'entity.too.large') {
        console.error(`Global Error: Payload too large (limit: ${err.limit})`);
        return res.status(413).json({ message: "File too large. Please upload a smaller image." });
    }

    // Generic error logging - limited to avoid flooding
    const errorMessage = err.message || "Unknown error";
    const errorDetails = err.stack ? err.stack.split('\n')[0] : ""; // Log only the first line of stack trace
    console.error(`Global Error: ${errorMessage}`);
    console.error(`Details: ${errorDetails}`);

    res.status(500).json({ message: "Internal Server Error" });
});

//here we are using nodemon because each time we make changes it will automatically restarted
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})
