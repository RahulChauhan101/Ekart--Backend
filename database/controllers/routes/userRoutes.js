import express from "express";

import {
  register,
  allUsers,
  verify,
  login,
  logout,
  forgotPassword,
  verifyOTP,
  changePassword,
  getUserbyId,
  getProfile,
  updateProfile,
  updateProfilePic,
} from "../userControllers.js";

import { isAdmin, isAuthenticated } from "../middleware/isAuthanticated.js";
import upload from "../../../config/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verify);

router.get("/profile", isAuthenticated, getProfile);
router.patch("/profile", isAuthenticated, updateProfile);

router.patch(
  "/profile-pic",
  isAuthenticated,
  upload.single("profilepic"),
  updateProfilePic
);

router.post("/logout", isAuthenticated, logout);
router.post("/all-users", isAuthenticated, isAdmin, allUsers);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);
router.post("/get-user/:id", getUserbyId);

export default router;