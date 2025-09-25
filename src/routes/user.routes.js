import { Router } from "express";
import { changeCurrentPassword, getcurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAcoountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)    

// Secured Routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword)
router.route("/getcurrentUser").post(verifyJWT,getcurrentUser)
router.route("/updateAcoountDetails").post(verifyJWT,updateAcoountDetails)
router.route("/updateUserAvatar").post(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/updateUserCoverImage").post(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

export default router