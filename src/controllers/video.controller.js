
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/fileUpload.js"

// Uploading Video with Thubnail,title,description, tags.

/* Process Flow: 
1. Check whether user is logged in or not.
2. If not ask him to Login first.
3. If Logged in, take data as Form Data, as done in Register
4. Upload video using multer from system -> Cloudinary -> then Cloudinary's link stored in Mongo DB as done with Register
5. Add Title, description , visibility  tags fields as form fields
6. Owner would get joined from user's id (as logged in user will only be uploading video)
7. That's it Video is uploaded, paginate would spread it evenly on home page

// Upload Video Controller Responsibilities: 

1. Ensure user is authenticated (req.user exists)
2. Read form fields:
   - title
   - description
   - visibility
   - tags
3. Read uploaded files:
   - videoFile
   - thumbnail
4. Upload both to Cloudinary
5. Extract:
   - secure_url
   - duration (from video upload)
6. Create Video document
7. Return clean API response
*/

const uploadVideo = asyncHandler(async (req, res) => {
  // 1️⃣ Auth check (safety, middleware already does this)
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  // 2️⃣ Extract fields
  const { title, description, visibility = "public", tags } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // 3️⃣ Extract files
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // 4️⃣ Upload to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoLocalPath, "video");
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

  if (!uploadedVideo?.url) {
    throw new ApiError(500, "Video upload failed");
  }

  if (!uploadedThumbnail?.url) {
    throw new ApiError(500, "Thumbnail upload failed");
  }

  // 5️⃣ Create video document
  const video = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title,
    description,
    visibility,
    tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
    duration: uploadedVideo.duration || 0,
    owner: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      video,
      "Video uploaded successfully"
    )
  );
});

export { uploadVideo };
