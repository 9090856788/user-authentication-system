import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

/**
 * Sends a One-Time Password (OTP) to the specified email address using Nodemailer.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The One-Time Password to be sent.
 */
export const sendEmailOTP = async (email, otp) => {
  try {
    // Create a transporter object using SMTP transport with environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent: ${info.response}`);
  } catch (error) {
    console.error(`Failed to send OTP email: ${error.message}`);
  }
};
