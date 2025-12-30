import express, { Router } from "express";
import { register,allUsers, verify,  login,logout, forgotPassword, verifyOTP, changePassword,getUserbyId } from "../userControllers.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthanticated.js";

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




export default router;
