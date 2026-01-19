import { Router } from "express";
import { uploadVideo , getAllVideos , getVideoById, incrementVideoViews, getChannelVideos, updateVideo, deleteVideo } from "../controllers/video.controller.js";
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

router.get("/", getAllVideos);

// 🔥 SPECIFIC routes FIRST
router.get("/channel/:userId", getChannelVideos);

// 🔥 THEN generic param routes
router.get("/:videoId", getVideoById);
router.post("/:videoId/views", incrementVideoViews);

router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);


export default router;
