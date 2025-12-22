import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./database/controllers/routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());

// routes
app.use("/api/users", userRoutes);

// connect DB FIRST, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Ekart backend server running on port ${PORT}`);
  });
});
