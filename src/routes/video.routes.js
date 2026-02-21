import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  incrementVideoViews,
  getChannelVideos,
  updateVideo,
  deleteVideo,
  searchVideos,
  filterVideos,
  queryVideos,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * Upload a new video
 * POST /api/v1/videos/upload
 */
router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

// 🔍 Search Videos - GET /api/v1/videos/search?query=...
router.get("/search", searchVideos);

// 🔎 Filter Videos - GET /api/v1/videos/filter?tags=...&sortBy=...
router.get("/filter", filterVideos);

// 📊 Query Videos with advanced filters - GET /api/v1/videos/query?search=...&sortBy=...
router.get("/query", queryVideos);

// Get all videos
router.get("/", getAllVideos);

// 🔥 SPECIFIC routes FIRST
router.get("/channel/:userId", getChannelVideos);

// 🔥 THEN generic param routes
router.get("/:videoId", getVideoById);
router.post("/:videoId/views", incrementVideoViews);

router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);

export default router;
