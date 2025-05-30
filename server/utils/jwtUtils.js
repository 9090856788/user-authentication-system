import jwt from "jsonwebtoken";

// ✅ Load secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// ✅ Generate short-lived access token (15 minutes)
// @param   userId - MongoDB user ID
// @returns JWT access token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// ✅ Generate long-lived refresh token (7 days)
// @param   userId - MongoDB user ID
// @returns JWT refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
