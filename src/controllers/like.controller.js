import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Like removed"));
  } else {
    const like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { isLiked: true }, "Video liked"));
  }
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Like removed"));
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, { isLiked: true }, "Comment liked"));
  }
});

// Get video likes count
const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const likesCount = await Like.countDocuments({ video: videoId });

  const isLikedByUser = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likesCount,
        isLiked: !!isLikedByUser,
      },
      "Video likes fetched successfully"
    )
  );
});

// Get comment likes count
const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const likesCount = await Like.countDocuments({ comment: commentId });

  const isLikedByUser = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likesCount,
        isLiked: !!isLikedByUser,
      },
      "Comment likes fetched successfully"
    )
  );
});

// Get all videos liked by user
const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const likes = await Like.find({ likedBy: req.user._id, video: { $ne: null } })
    .populate("video")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalLikes = await Like.countDocuments({
    likedBy: req.user._id,
    video: { $ne: null },
  });

  const videos = likes
    .map((like) => like.video)
    .filter((video) => video !== null);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          page,
          limit,
          total: totalLikes,
          pages: Math.ceil(totalLikes / limit),
        },
      },
      "Liked videos fetched successfully"
    )
  );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  getVideoLikes,
  getCommentLikes,
  getLikedVideos,
};
