import jwt from "jsonwebtoken";
import { User } from "../../../database/models/usermodels.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    // 🔍 DEBUG LOG
    console.log("RAW AUTH HEADER 👉", authHeader);

    // 🔐 Extract token properly from "Bearer <token>" format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing or invalid format",
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    console.log("EXTRACTED TOKEN 👉", token);
    console.log("JWT_SECRET BEING USED 👉", process.env.JWT_SECRET);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isloggedIn) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }

    req.id = user._id;
    req.user = user;
    next();

  } catch (error) {
    console.error("AUTH ERROR 👉", error.message);
    console.error("ERROR DETAILS 👉", {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" 
        ? "Token has expired. Please login again." 
        : "Invalid or expired access token",
    });
  }
};
