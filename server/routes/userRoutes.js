import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  updateUser,
  deleteUser,
  sendOTP,
  verifyOTP,
} from "../controllers/userController.js";

const router = express.Router();

// ✅ Update user profile
router.put("/update", isAuthenticated, updateUser);

// ✅ Delete user account
router.delete("/delete", isAuthenticated, deleteUser);

// ✅ Send OTP to user's email/phone
router.get("/send-otp", isAuthenticated, sendOTP);

// ✅ Verify OTP for account verification
router.post("/verify-otp", isAuthenticated, verifyOTP);

export default router;
