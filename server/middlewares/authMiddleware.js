import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { ErrorHandlers } from "./error.js";

// ✅ Middleware to check if user is authenticated
// @desc    Verifies JWT access token and attaches user to request
// @access  Protected routes only
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        ErrorHandlers("Authorization token missing or malformed", 401)
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(ErrorHandlers("User not found", 404));
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    return next(ErrorHandlers("Invalid or expired token", 401));
  }
};
