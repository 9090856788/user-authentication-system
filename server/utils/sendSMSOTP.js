import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

/**
 * Formats a phone number to E.164 format.
 * Assumes Indian numbers if no country code is provided.
 *
 * @param {string} number - The raw phone number (e.g., 9090856788)
 * @returns {string} - Formatted phone number (e.g., +919090856788)
 */
const formatPhoneNumber = (number) => {
  if (number.startsWith("+")) return number;
  return `+91${number}`; // Default to India; change if needed
};

/**
 * Sends a One-Time Password (OTP) to the specified phone number using Twilio SMS.
 *
 * @param {string} phoneNumber - The recipient's phone number.
 * @param {string} otp - The One-Time Password to be sent.
 */
export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });

    console.log(`OTP SMS sent: SID ${message.sid}`);
  } catch (error) {
    console.error(`Failed to send OTP SMS: ${error.message}`);
  }
};
