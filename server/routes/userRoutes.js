import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  getMe,
  updateUser,
  changePassword,
  deleteUser,
  sendOTP,
  verifyOTP,
} from "../controllers/userController.js";
import { otpLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/me", isAuthenticated, getMe);
router.put("/update", isAuthenticated, updateUser);
router.put("/change-password", isAuthenticated, changePassword);
router.delete("/delete", isAuthenticated, deleteUser);
router.get("/send-otp", isAuthenticated, otpLimiter, sendOTP);
router.post("/verify-otp", isAuthenticated, otpLimiter, verifyOTP);

export default router;
