import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true,
    },
    LastName: {
        type: String,
        required: true,
    },
    profilepic: {
        type: String,
        default: "",
    },
    profilepicpublicId: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    token: {
        type: String,
        default: null,
    },
    isverified: {
        type: Boolean,
        default: false,
    },
    isloggedIn: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpexpiry: {
        type: Date,
        default: null,
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipcode: String,
    phoneNumber: String,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
