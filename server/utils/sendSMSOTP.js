import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

/**
 * Sends a One-Time Password (OTP) to the specified phone number using Twilio SMS.
 *
 * @param {string} phoneNumber - The recipient's phone number in E.164 format (e.g., +919876543210).
 * @param {string} otp - The One-Time Password to be sent.
 */
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`OTP SMS sent: SID ${message.sid}`);
  } catch (error) {
    console.error(`Failed to send OTP SMS: ${error.message}`);
  }
};
