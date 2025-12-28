import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { sendOTPEmail } from "../controllers/Utils/sendOtpEmail.js";

import { User } from "../models/usermodels.js";
import { verifyEmail } from "../../emailVeryfiy/veryfiyEmail.js";
import { Session } from "../models/sessionModels.js";

export const register = async (req, res) => {
    try {
        const { FirstName, LastName, email, password } = req.body;

        if (!FirstName || !LastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            FirstName,
            LastName,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        // ✅ CORRECT ORDER
        await verifyEmail(email, token);

        newUser.token = token;
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            user: newUser,
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("VERIFY ENDPOINT - JWT_SECRET 👉", process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isverified) {
            return res.json({
                success: true,
                message: "Email already verified",
            });
        }

        user.isverified = true;
        user.token = null;
        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify Error:", error.message);
        return res.status(400).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


export const reVerify = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user =
            await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.isverified === true) {
            return res.status(200).json({
                success: true,
                message: "Email already verified",
            });
        }
   const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET, // ✅ SAME SECRET
  { expiresIn: "10m" }
);

        await verifyEmail(email, token);
        user.token = token;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Verification email resent successfully",
            token: user.token
        });
    }
    catch (error) {
        console.error("Re-Verify Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isverified !== true) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        user.token = token;
        user.isloggedIn = true;
        await user.save();

             // 🧾 Create session
        await Session.create({
            userId: user._id,
            token,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });   

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                FirstName: user.FirstName,
                LastName: user.LastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const logout = async (req, res) => {
  const user = await User.findById(req.id);

  user.isloggedIn = false;
  user.token = null;
  await user.save();

  res.json({
    success: true,
    message: "Logout successful",
  });
};



// export const Authlogout = async (req, res) => {
//     const user = await User.findById(req.id);
//     user.isloggedIn = false;
//     user.token = null;
//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: "Logout successful",
//     });
// };





export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 🔢 Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        user.otp = otp;
        user.otpexpiry = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        // 📧 Send OTP email
        await sendOTPEmail(email, otp);

        return res.json({
            success: true,
            message: "OTP sent to your email",
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user || !user.otp || !user.otpexpiry) {
            return res.status(400).json({
                success: false,
                message: "Invalid request",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (user.otpexpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        // 🔐 Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpexpiry = null;
        user.token = null;

        await user.save();

        return res.json({
            success: true,
            message: "Password reset successful",
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};




