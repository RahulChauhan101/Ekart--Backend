import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { User } from "../models/usermodels.js";
import { verifyEmail } from "../../emailVeryfiy/veryfiyEmail.js";

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
            process.env.SECRET_KEY,
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
        // 🔐 Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or malformed",
            });
        }

        const token = authHeader.split(" ")[1];

        // 🔍 Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "Token has expired",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid token",
            });
        }

        // 👤 Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ✅ Already verified
        if (user.isverified === true) {
            return res.status(200).json({
                success: true,
                message: "Email already verified",
            });
        }

        // ✅ Set verified TRUE
        user.isverified = true;
        user.token = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Verify Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
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
            process.env.SECRET_KEY,
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
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({

                success: false,
                message: "Invalid password",
            });
        }


        if (user.isverified === false) {
            return res.status(401).json({
                success: false,
                message: "Email not verified",
            });
        }


        user.isloggedIn = true;
        await user.save();
        return res.status(200).json({


            success: true,



            message: "Login successful",
            user: user,
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
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        user.isloggedIn = false;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

import crypto from "crypto";



export const otp = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔐 Validate
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 👤 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔢 Generate 6-digit OTP
    const generatedOtp = crypto.randomInt(100000, 999999).toString();

    // ⏰ OTP expiry (5 minutes)
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    // 💾 Save OTP
    user.otp = generatedOtp;
    user.otpexpiry = otpExpiry;
    await user.save();

    // 📧 Email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 📩 Send OTP email
    await transporter.sendMail({
      from: `"Ekart Team" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - Ekart",
      text: `Your OTP is ${generatedOtp}. It is valid for 5 minutes.`,
      html: `
        <h2>Ekart OTP Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${generatedOtp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



