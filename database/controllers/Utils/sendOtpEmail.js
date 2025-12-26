import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"Ekart Support" <${process.env.MAIL_USER}>`,
        to,
        subject: "Password Reset OTP",
        html: `
            <h2>Password Reset</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>Valid for 10 minutes</p>
        `,
    });
};
