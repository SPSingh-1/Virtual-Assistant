import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
const uploadOnCloudinary= async(filePath) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
         const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", // handles images, videos, etc.
        });
        fs.unlinkSync(filePath); // remove file from server after upload
         return uploadResult.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // remove file safely
        throw error; // <-- let controller handle error response
    }
}

export default uploadOnCloudinary;