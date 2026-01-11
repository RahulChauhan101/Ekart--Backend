import express, { Router } from "express";
import { register,allUsers, verify,  login,logout, forgotPassword, verifyOTP, changePassword,getUserbyId,updateProfile   } from "../userControllers.js";
import { isAdmin, isAuthenticated  } from "../middleware/isAuthanticated.js";
 import upload from "../middleware/multer.js";
const router = express.Router();

router.post("/register", register);
router.post("/all-users",isAuthenticated, isAdmin, allUsers);
router.post("/verify", verify);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);
router.post("/get-user/:id", getUserbyId);
router.put(
  "/update-profile",
  isAuthenticated,          // 🔐 JWT
  upload.single("profilepic"),// 🖼 image field name
  updateProfile
);





export default router;