import asyncHandler from "../utils/asyncHandler.js";
import{ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/fileUpload.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken =async(userId)=>
{
 try{
   const user= await User.findById(userId)
   const acessToken=user.generateAccessToken()
   const refreshToken=user.generateRefreshToken()
   
   user.refreshToken=refreshToken
   await user.save({validateBeforeSave: false})

   return {acessToken,refreshToken}

 } catch (error){
     throw new ApiError(500,"Something went wrong while generting tokens")
 }

}
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

   const existedUser= await User.findOne({
         $or: [{username}, {email}]
   })

   if(existedUser){
      throw new ApiError(409,"User with email or username already exist")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path
   // const coverImageLocalPath=req.files?.coverImage[0]?.path
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
      coverImageLocalPath=req.files.coverImage[0].path
   }

   console.log(req.body);
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

   const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
     throw new ApiError(500,"Something went wrong while registering user")
   }
   

   return res.status(201).json(
       new ApiResponse(200,createdUser,"User Registered Sucessfully")
   )



})

const loginUser =asyncHandler(async (req,res)=>{

      /* 
      Algo:
      1. Taking fields from frontend: email, password / username,password (req->body)
      2. If, password matches then, login to system and generate an acess token (shorter lived) and refresh token(longer lived)
      For eg, if a login session ends in 15 min, the user losses acess to upload,etc (Acess Token expired), 
      in that case we can use refresh token,it is stored in both the places (server as well as with user)
      if refresh token at both the side matches, we login the user again.
      3. Send the token in the form of cookies
      3. If username or password does'nt match..give error
      4. An option to forgot password
      5. User needs to enter his/her email and username both
      6. Email with link to reset the password
      7. Resetting the password and logging in 
      */
   const {email,username,password} =req.body
   if(!(username || email)) {
      throw new ApiError(400,"Username or Email is required")
   }
   
   const user= await User.findOne({
      $or: [{username},{email}]
   })
   
   if(!user){
      throw new ApiError(404,"User does not exist")
   }
   const isPasswordValid=await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401,"Invalid User Credential")
   }
   const {acessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

   // sending in secure cookies
   const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

   const options ={
      httpOnly:true,
      secure:true
   }

   return res.
   status(200)
   .cookie("accessToken",acessToken, options)
   .cookie("refreshToken",refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser, acessToken,
            refreshToken
         },
         "User Logged In Sucessfully"
      )
   )



})

const logoutUser =asyncHandler(async (req,res)=>{
     await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset:{
            refreshToken:""
         }
      },
      {
         new: true
      }
   )
   const options ={
      httpOnly:true,
      secure:true
   }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged out "))
     
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
   // Encrypted Refresh Token
   const IncomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
   if(!IncomingRefreshToken){
      throw new ApiError(401,"Unauthorized Request")
   }
try {
      // Decoded Refresh Token from User's end
      const decodedToken=jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      // Extracting payload from decoded refreshToken, In our case _id
      const user= await User.findById(decodedToken?._id)
   
      if(!user){
         throw new ApiError(401,"Invalid Refresh Token")
      }
      
      // Matching encrypted Refresh Token at user's end and
      // DB
      if(IncomingRefreshToken!=user?.refreshToken){
          throw new ApiError(401,"Refresh Token is Expired or used")
      }
   
     const options ={
      httpOnly:true,
      secure:true
     } 
     const {acessToken,newRefreshToken}=await generateAccessTokenAndRefreshToken(user_id)
   
     return res
     .status(200)
     .cookie("accessToken",acessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
     )
} catch (error) {
   throw new ApiError(401,error?.message || "Invalid Refresh Token")
}
})

const changeCurrentPassword =asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword} =req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect=user.isPasswordCorrect(oldPassword)
   
   if(!isPasswordCorrect){
      throw new ApiError(400,"Invalid old password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password Changed Sucessfully"))
})

const getcurrentUser =asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(200,req.user,"Current User Fetched")
 })

const updateAcoountDetails = asyncHandler(async(req,res)=>{
   const {fullName,email} =req.body

   if(!fullName || !email){
      throw new ApiError(400,"All fields are required")
   }

   const user= await User.findByIdAndUpdate(
   req.user?._id,
   {
       $set:{
         fullName,
         email
       }

   },{new:true}
).select("-password")

  return res
  .status(200).
  json(new ApiResponse(200,user,"Account details updated Succesfully!"))
 })

const updateUserAvatar=asyncHandler(async(req,res)=>
{
   const localPath = req.file?.path

   if(!localPath){
      throw new ApiError(400,"Avatar File is missing")
   }

   const avatar =await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400,"Error while Uploading Avatar")
   }

   const user= await User.findByIdAndUpdate(req.user?._id,
      {
         $set:{
            avatar:avatar.url
         }
      },
      {new: true}
   ).select("-password")

return res
.status(200)
.json(
   new ApiResponse(200,user,"Avatar Image updated successfully")
)
})

const updateUserCoverImage=asyncHandler(async(req,res)=>
{
   const localPath = req.file?.path

   if(!localPath){
      throw new ApiError(400,"CoverImage File is missing")
   }

   const coverImage =await uploadOnCloudinary(avatarLocalPath)

   if(!coverImage.url){
      throw new ApiError(400,"Error while Uploading Avatar")
   }

   const user= await User.findByIdAndUpdate(req.user?._id,
      {
         $set:{
           coverImage:coverImage.url
         }
      },
      {new: true}
   ).select("-password")

return res
.status(200)
.json(
   new ApiResponse(200,user,"Cover Image updated successfully")
)

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getcurrentUser,
    updateAcoountDetails,
    updateUserAvatar,
    updateUserCoverImage
}