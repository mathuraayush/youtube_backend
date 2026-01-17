import  asyncHandler  from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

// Getting all Videos (on home page!)

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pipeline = Video.aggregate([
    { $match: { visibility: "public" } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  const options = {
    page: Number(page),
    limit: Number(limit),
  };

  const videos = await Video.aggregatePaginate(pipeline, options);

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );
});

// get one video (viewing page)

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
  ]);

  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(
    new ApiResponse(200, video[0], "Video fetched successfully")
  );
});

// increment views

const incrementVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  return res.status(200).json(
    new ApiResponse(200, null, "View count updated")
  );
});

// Getting Channel Videos

const getChannelVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pipeline = Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
  ]);

  const videos = await Video.aggregatePaginate(pipeline, {
    page,
    limit,
  });

  return res.status(200).json(
    new ApiResponse(200, videos, "Channel videos fetched")
  );
});

// updating video's description,title,etc (owner only!)

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, tags, visibility } = req.body;

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    {
      title,
      description,
      tags,
      visibility,
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(403, "Not authorized or video not found");
  }

  return res.status(200).json(
    new ApiResponse(200, video, "Video updated successfully")
  );
});

// Deleting video (owner only!)

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(403, "Not authorized or video not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  );
});



export { 
        uploadVideo,
        getAllVideos,
        incrementVideoViews,
        deleteVideo,
        updateVideo,
        getChannelVideos,
        getVideoById 
        };
