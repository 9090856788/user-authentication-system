import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ✅ Generate short-lived access token (15 minutes)
// @param   userId - MongoDB user ID
// @returns JWT access token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

// ✅ Generate long-lived refresh token (7 days)
// @param   userId - MongoDB user ID
// @returns JWT refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
