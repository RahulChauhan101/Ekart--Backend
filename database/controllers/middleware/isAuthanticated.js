import jwt from "jsonwebtoken";
import { User } from "../../../database/models/usermodels.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token = authHeader.slice(7); // remove Bearer

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ DO NOT CHECK isloggedIn here
    req.user = user;
    req.id = user._id;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next(); // ✅ allow admin
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
};
