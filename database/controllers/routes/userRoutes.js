import express from "express";
import { register } from "../userControllers.js";

const router = express.Router();

router.post("/register", register);

export default router;
