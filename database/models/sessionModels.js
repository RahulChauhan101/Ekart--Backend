// sessionModels.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    ip: String,
    userAgent: String,
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const Session = mongoose.model("Session", sessionSchema);
