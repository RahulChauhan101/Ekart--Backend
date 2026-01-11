import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { initCloudinary } from "./database/controllers/Utils/cloudinary.js";

import connectDB from "./database/db.js";
import userRoutes from "./database/controllers/routes/userRoutes.js";

// __dirname setup (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv load (once)
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("ENV CHECK 👉", {
  PORT: process.env.PORT,
  MONGO: process.env.MONGO_URI ? "OK" : "MISSING",
  CLOUDINARY: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
});

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/users", userRoutes);

// 🔥 FINAL START FUNCTION
const startServer = async () => {
  try {
    await connectDB();

    initCloudinary(); // 🔥 VERY IMPORTANT (after dotenv)

    app.listen(PORT, () => {
      console.log(`🚀 Ekart backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error.message);
  }
};

startServer();

