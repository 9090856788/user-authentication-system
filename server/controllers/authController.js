import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import { sendSMSOTP } from "../utils/sendSMSOTP.js";
import jwt from "jsonwebtoken";

// ✅ Register User
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return next(ErrorHandlers("Please fill all the required fields", 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(
      ErrorHandlers("User already exists with this email or username", 409)
    );
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    },
  });
});

// ✅ Login User
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return next(ErrorHandlers("Email/Username and Password are required", 400));
  }

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });

  if (!user || !(await user.comparePassword(password))) {
    return next(ErrorHandlers("Invalid credentials", 401));
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    },
  });
});

// ✅ Logout User
export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ✅ Refresh Access Token
export const refreshAccessToken = catchAsyncError(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) return next(ErrorHandlers("Refresh token not found", 401));

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return next(ErrorHandlers("Invalid or expired refresh token", 403));

    const accessToken = generateAccessToken(decoded.id);

    res.status(200).json({
      success: true,
      accessToken,
    });
  });
});

// ✅ Request Password Reset
export const requestPasswordReset = catchAsyncError(async (req, res, next) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return next(ErrorHandlers("Email or phone number is required", 400));
  }

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
  });

  if (!user) return next(ErrorHandlers("User not found", 404));

  const otp = generateOTP();
  const otpExpire = Date.now() + 10 * 60 * 1000;

  user.verificationCode = otp;
  user.verificationCodeExpire = otpExpire;

  await user.save();

  if (user.email) await sendEmailOTP(user.email, otp);
  if (user.phoneNumber) await sendSMSOTP(user.phoneNumber, otp);

  res.status(200).json({
    success: true,
    message: "OTP sent for password reset",
  });
});

// ✅ Verify OTP for Password Reset
export const verifyResetOTP = catchAsyncError(async (req, res, next) => {
  const { emailOrPhone, otp } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
  });

  if (
    !user ||
    user.verificationCode !== otp ||
    user.verificationCodeExpire < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP", 400));
  }

  res.status(200).json({
    success: true,
    message: "OTP verified. You can now reset your password.",
  });
});

// ✅ Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { emailOrPhone, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return next(ErrorHandlers("Password must be at least 8 characters", 400));
  }

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
  });

  if (
    !user ||
    user.verificationCode !== otp ||
    user.verificationCodeExpire < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP", 400));
  }

  user.password = newPassword;
  user.verificationCode = "";
  user.verificationCodeExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
