import express from "express";
import { register, verify, reVerify, login,logout, forgotPassword, resetPassword } from "../userControllers.js";
import { isAuthenticated } from "../middleware/isAuthanticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/reverify", reVerify);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

// router.post("/Authlogout", isAuthenticated, Authlogout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



export default router;
