import { Router } from "express";
import {
    changeCurrentPassword,
    getcurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAcoountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)

// Secured Routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword)
router.route("/getcurrentUser").get(verifyJWT, getcurrentUser)
router.route("/updateAcoountDetails").patch(verifyJWT, updateAcoountDetails)
router.route("/updateUserAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/updateUserCoverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT, getWatchHistory)


export default router  