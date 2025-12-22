import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoutes from "./database/controllers/routes/userRoutes.js";

dotenv.config(); // 🔥 MUST be before using process.env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users", userRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Ekart backend server running on port ${PORT}`);
  });
});
