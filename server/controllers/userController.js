import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";
import { sendSMSOTP } from "../utils/sendSMSOTP.js";

// ✅ Update User
export const updateUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

  // Merge new data into existing user object
  Object.assign(user, req.body);

  // Save updated user (triggers password hashing if password is updated)
  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      ...req.body,
    },
  });
});

// ✅ Delete User
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

  // Clear refresh token cookie on account deletion
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "User account deleted successfully",
  });
});

// ✅ Send OTP to user's email and/or phone
export const sendOTP = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

  const otp = generateOTP();
  const otpExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  user.verificationCode = otp;
  user.verificationCodeExpire = otpExpire;

  await user.save();

  // Send OTP via email and/or SMS
  if (user.email) await sendEmailOTP(user.email, otp);
  if (user.phoneNumber) await sendSMSOTP(user.phoneNumber, otp);

  res.status(200).json({
    success: true,
    message: "OTP sent to email and phone",
  });
});

// ✅ Verify OTP for account verification
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(ErrorHandlers("OTP is required", 400));

  const user = await User.findById(req.user._id);
  if (!user) return next(ErrorHandlers("User not found", 404));

  // Check if OTP matches and is not expired
  if (
    user.verificationCode !== otp ||
    user.verificationCodeExpire < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP", 400));
  }

  // Mark account as verified and clear OTP fields
  user.accountVerified = true;
  user.verificationCode = "";
  user.verificationCodeExpire = null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully. Account is now verified.",
  });
});
