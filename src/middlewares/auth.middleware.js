import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const legacyHeaderToken = req.header("x-access-token");
  const cookieToken = req.cookies?.accessToken;

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
  const rawAuthToken = authHeader && !authHeader.startsWith("Bearer ")
    ? authHeader
    : null;
  const bodyToken = req.body?.accessToken;
  const queryToken = req.query?.accessToken;

  const token =
    bearerToken ||
    cookieToken ||
    legacyHeaderToken ||
    rawAuthToken ||
    bodyToken ||
    queryToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decodedToken._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = user;
  next();
});
