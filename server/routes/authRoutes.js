import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authController.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/logout", logoutUser);
router.get("/refresh-token", refreshAccessToken);

router.post("/request-password-reset", otpLimiter, requestPasswordReset);
router.post("/verify-reset-otp", otpLimiter, verifyResetOTP);
router.post("/reset-password", otpLimiter, resetPassword);

export default router;
