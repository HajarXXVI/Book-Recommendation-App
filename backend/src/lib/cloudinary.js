import {v2 as cloudinary} from "cloudinary"; //used to upload images to cloudinary instead of local storage
import "dotenv/config"; //to access the env variables

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;