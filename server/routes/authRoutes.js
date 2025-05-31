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

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/refresh-token", refreshAccessToken);

// Password reset routes
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
