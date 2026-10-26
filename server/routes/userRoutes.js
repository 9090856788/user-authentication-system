import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  updateUser,
  deleteUser,
  sendOTP,
  verifyOTP,
} from "../controllers/userController.js";
import { otpLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.put("/update", isAuthenticated, updateUser);
router.delete("/delete", isAuthenticated, deleteUser);
router.get("/send-otp", isAuthenticated, otpLimiter, sendOTP);
router.post("/verify-otp", isAuthenticated, otpLimiter, verifyOTP);

export default router;
