import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
import connectDB from "./database/db.js";
import userRoutes from "./database/controllers/routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ VERY IMPORTANT
app.use(cors({
  origin: "http://localhost:5173", // React/Vite frontend
  credentials: true
}));

app.use(express.json());
app.use("/api/users", userRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Ekart backend server running on port ${PORT}`);
  });
});
