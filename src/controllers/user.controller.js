import asyncHandler from "../utils/asyncHandler.js";
import{ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/fileUpload.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
const registerUser=asyncHandler(async (req,res)=>{
   // Steps
   /*
   1. Get user details from frontend
   2. Validations - not Empty
   3. Check if User already exist: username and email
   4. Check if files (Avatar and Cover Image)
   5. Upload files to Cloudinary: Check if Avatar is uploaded or not
   6. Fetching url from Cloudinary
   7. Create User Object - Create entry in db
   8. Remove Password and Refresh token Field from Response
   9. Check for user Creation
   10. Return Response

   */
   const{fullName,email,username,password }=req.body
   console.log("email: ",email);

//    if(fullName ===""){
//     throw new ApiError(400,"FullName is Required")
//    }
   if (
      [fullName,email,username,password].some((field)=>
       field?.trim()==="")
     ) {
      throw new ApiError(400,"All fields are required")
   }

   const existedUser= User.findOne({
         $or: [{username}, {email}]
   })

   if(existedUser){
      throw new ApiError(409,"User with email or username already exist")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath=req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is Required")
   }
   

   const avatar= await  uploadOnCloudinary(avatarLocalPath)
   const coverImage= await  uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar File is Required")
   }

   
   const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const createdUser =await user.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
     throw new ApiError(500,"Something went wrong while registering user")
   }
   

   return res.status(201).json(
       new ApiResponse(200,createdUser,"User Registered Sucessfully")
   )



})

export {
    registerUser
}