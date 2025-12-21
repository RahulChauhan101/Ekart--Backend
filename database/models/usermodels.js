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
        required: false,
        default: "",
    }, // cloudinary  image url
    profilepicpublicId: {
        type: String,
        required: false,
        default: "",
    }, // cloudinary image public id for deletion
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
        default: "user"
    },
    token: {
        type: String,
        default: null
    },
    isverified: {
        type: String,
        default: false,
    },
    isloggedIn: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null
    },
    otpexpiry: {
        type: Date,
        default: null
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    zipcode: {
        type: String,
    },
    phonNomber: {
        type: String,
    }
}, { timestamps: true });         


export const User = mongoose.model("User", userSchema);