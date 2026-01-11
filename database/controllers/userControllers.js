import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import streamifier from "streamifier";

import { User } from "../models/usermodels.js";
import { Session } from "../models/sessionModels.js";

import { sendOTPEmail } from "../controllers/Utils/sendOtpEmail.js";
import { verifyEmail } from "../../emailVeryfiy/veryfiyEmail.js";
import { cloudinary } from "../controllers/Utils/cloudinary.js";

/* =========================================================
   HELPER: CLOUDINARY STREAM UPLOAD (FAST & SAFE)
========================================================= */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "profiles",
        resource_type: "image",
        timeout: 60000,
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/* =========================================================
   REGISTER
========================================================= */
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

    await verifyEmail(email, token);

    newUser.token = token;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   VERIFY EMAIL
========================================================= */
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

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isverified) {
      user.isverified = true;
      user.token = null;
      await user.save();
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        email: user.email,
        role: user.role,
        isverified: user.isverified,
        profilepic: user.profilepic || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================================
   LOGOUT
========================================================= */
export const logout = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    user.isloggedIn = false;
    user.token = null;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   FORGOT PASSWORD (OTP)
========================================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpexpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   VERIFY OTP
========================================================= */
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpexpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (user.otpexpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = null;
    user.otpexpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */
export const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   GET ALL USERS
========================================================= */
export const allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpexpiry");
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   GET USER BY ID
========================================================= */
export const getUserbyId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -otp -otpexpiry -token"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* =========================================================
   UPDATE PROFILE (FINAL FIXED)
========================================================= */


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      pinCode,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // text fields
    user.FirstName = firstName;
    user.LastName = lastName;
    user.phoneNumber = phone;
    user.address = address;
    user.city = city;
    user.zipcode = pinCode;

    // ✅ IMAGE UPLOAD
    if (req.file) {
      // delete old image (optional but recommended)
      if (user.profilepicpublicId) {
        await cloudinary.uploader.destroy(user.profilepicpublicId);
      }

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "profiles",
        }
      );

      user.profilepic = result.secure_url;        // ✅ URL
      user.profilepicpublicId = result.public_id; // ✅ publicId
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

