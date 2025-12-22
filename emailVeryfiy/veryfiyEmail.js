import nodemailer from "nodemailer";
import "dotenv/config";

// export const verifyEmail = async (email, token) => {
//   try {
//     // ✅ transporter is defined in the SAME scope where it's used
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     const mailConfigurations = {
//       from: process.env.MAIL_USER,
//       to: email,
//       subject: "Email Verification",
//       text: `Hi 👋,

// Please verify your email by clicking the link below:
// http://localhost:5173/verify/${token}

// This link will expire in 10 minutes.

// Thanks,
// Ekart Team`,
//     };

//     await transporter.sendMail(mailConfigurations);

//     console.log("✅ Email Sent Successfully");
//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     // ❗ DO NOT throw error (prevents server crash)
//   }
// };

export const verifyEmail = async (email, token) => {
  try {
    if (!email) {
      console.log("❌ Email is missing, mail not sent");
      return;
    }


    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // ❗ false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App password
  },
});


    const mailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email Verification",
      text: `Hi 👋,

Please verify your email by clicking the link below:
http://localhost:5173/verify/${token}

This link will expire in 10 minutes.

Thanks,
Ekart Team`,
    };

    console.log("📧 Sending email to:", email); // 🔥 DEBUG

    await transporter.sendMail(mailConfigurations);

    console.log("✅ Email Sent Successfully");
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};
