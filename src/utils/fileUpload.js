import {v2 as cloudinary} from "cloudinary" 
import { response } from "express";
import fs from "fs"
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
       if(!localFilePath) return null;
       //upload file on Cloudinary
       const result = await cloudinary.uploader.upload(localFilePath,{
          resource_type:"auto",

       })
       //File has been uploaded succesfully
       console.log("file has been uploaded succesfully on cloudinary", result.url);
       fs.unlinkSync(localFilePath) // Remove temp file after upload
       return result;
    } catch(error){
         if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
         return null;// Remove the locally saved temp file as the upload operation got failed
    }
}
export {uploadOnCloudinary}