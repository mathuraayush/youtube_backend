import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  getVideoLikes,
  getCommentLikes,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.route("/toggle/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/toggle/comment/:commentId").post(verifyJWT, toggleCommentLike);

// Public routes
router.route("/video/:videoId").get(verifyJWT, getVideoLikes);
router.route("/comment/:commentId").get(verifyJWT, getCommentLikes);

// Get user's liked videos
router.route("/user/videos").get(verifyJWT, getLikedVideos);

export default router;
