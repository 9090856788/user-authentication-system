import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import jwt from "jsonwebtoken";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { fullName, username, email, password, phoneNumber } = req.body;

  if (!fullName || !username || !email || !password) {
    return next(ErrorHandlers("Please fill all the required fields", 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    return next(ErrorHandlers("User already exists with this email or username", 409));
  }

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 15 * 60 * 1000);

  const user = await User.create({
    fullName,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password,
    phoneNumber: phoneNumber ? phoneNumber.trim() : "",
    verificationCode: otp,
    verificationCodeExpire: otpExpire,
    accountVerified: false,
    role: "user",
    accountStatus: "active",
  });

  if (user.email) {
    await sendEmailOTP(user.email, otp);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully. Verification code sent to email.",
    accessToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      accountVerified: user.accountVerified,
      role: user.role,
    },
  });
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return next(ErrorHandlers("Email/Username and Password are required", 400));
  }

  const identifier = emailOrUsername.toLowerCase().trim();
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user || !(await user.comparePassword(password))) {
    return next(ErrorHandlers("Invalid credentials", 401));
  }

  if (user.accountStatus === "suspended") {
    return next(ErrorHandlers("This account is suspended. Please contact support.", 403));
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
      phoneNumber: user.phoneNumber,
      accountVerified: user.accountVerified,
      role: user.role,
      accountStatus: user.accountStatus,
      bio: user.bio,
      gender: user.gender,
      address: user.address,
      preferences: user.preferences,
    },
  });
});

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

export const refreshAccessToken = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) return next(ErrorHandlers("Refresh token not found", 401));

  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "fallback_dev_refresh_secret_key_32chars_min";

  jwt.verify(token, refreshSecret, async (err, decoded) => {
    if (err) {
      return next(ErrorHandlers("Invalid or expired refresh token", 403));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(ErrorHandlers("User account associated with this token no longer exists", 401));
    }

    if (user.accountStatus === "suspended") {
      return next(ErrorHandlers("Account suspended", 403));
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        accountVerified: user.accountVerified,
      },
    });
  });
});

export const requestPasswordReset = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(ErrorHandlers("Email address is required", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return next(ErrorHandlers("User not found with this email", 404));
  }

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = otp;
  user.verificationCodeExpire = otpExpire;
  await user.save();

  await sendEmailOTP(user.email, otp);

  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your email address",
  });
});

export const verifyResetOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(ErrorHandlers("Email and OTP code are required", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (
    !user ||
    user.verificationCode !== String(otp).trim() ||
    new Date(user.verificationCodeExpire).getTime() < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP code", 400));
  }

  res.status(200).json({
    success: true,
    message: "OTP code verified successfully. You may now reset your password.",
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return next(ErrorHandlers("Password must be at least 8 characters long", 400));
  }

  const user = await User.findOne({ email: email ? email.toLowerCase().trim() : "" });

  if (
    !user ||
    user.verificationCode !== String(otp).trim() ||
    new Date(user.verificationCodeExpire).getTime() < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP code", 400));
  }

  user.password = newPassword;
  user.verificationCode = "";
  user.verificationCodeExpire = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new credentials.",
  });
});
