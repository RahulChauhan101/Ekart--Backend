import { User } from "../models/usermodels";

export const registerUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        const newUser = new User({
            firstname,
            lastname,
            email,
            password
        });
        await newUser.save();
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }
}