import express from "express";
import { register, verify, reVerify, login,logout, forgotPassword, verifyOTP, resetPassword, changePassword } from "../userControllers.js";
import { isAuthenticated } from "../middleware/isAuthanticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/reverify", reVerify);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/change-password", changePassword);


router.post("/reset-password", resetPassword);



export default router;
