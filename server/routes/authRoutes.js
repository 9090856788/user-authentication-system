import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/authController.js";

const router = express.Router();

// ✅ Register a new user
router.post("/register", registerUser);

// ✅ Login user and issue tokens
router.post("/login", loginUser);

// ✅ Logout user and clear refresh token
router.get("/logout", logoutUser);

// ✅ Refresh access token using refresh token
router.get("/refresh-token", refreshAccessToken);

export default router;
