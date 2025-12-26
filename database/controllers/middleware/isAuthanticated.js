// import jwt from "jsonwebtoken";
// import { User } from "../../../database/models/usermodels.js";
// export const isAuthenticated = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Access token missing",
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         let decoded;
//         try {
//             // decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = jwt.verify(token, process.env.JWT_SECRET);

//         } catch (err) {
//             return res.status(401).json({
//                 success: false,
//                 message:
//                     err.name === "TokenExpiredError"
//                         ? "Access token expired"
//                         : "Invalid access token",
                        
//             });
//         }
        

//         const user = await User.findById(decoded.id);
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // ❌ REMOVE isloggedIn check from middleware
//         req.id = user._id;
//         req.user = user;
//         next();

//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: "Unauthorized",
//         });
//     }
// };

import jwt from "jsonwebtoken";
import { User } from "../../../database/models/usermodels.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 🔹 Token from HEADER or BODY
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.body.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.id = user._id;
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};
