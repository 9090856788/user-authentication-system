import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { ErrorHandlers } from "./error.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(ErrorHandlers("Authorization token missing or malformed", 401));
    }

    const token = authHeader.split(" ")[1];
    const accessSecret = process.env.ACCESS_TOKEN_SECRET || "fallback_dev_access_secret_key_32chars_min";

    const decoded = jwt.verify(token, accessSecret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(ErrorHandlers("User account not found", 404));
    }

    if (user.accountStatus === "suspended") {
      return next(ErrorHandlers("Account is suspended. Please contact support.", 403));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AuthMiddleware error:", err.message);
    return next(ErrorHandlers(`Invalid or expired authorization token: ${err.message}`, 401));
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ErrorHandlers("Authentication required", 401));
  }
  if (req.user.role !== "admin") {
    return next(ErrorHandlers("Forbidden: Administrator privileges required", 403));
  }
  next();
};
