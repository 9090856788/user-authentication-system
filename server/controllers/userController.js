import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";

export const updateUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

  const {
    fullName,
    phoneNumber,
    gender,
    dob,
    address,
    bio,
    socialLinks,
    preferences,
    language,
    timeZone,
  } = req.body;

  // Selective field updates to guard against unauthorized privilege escalation
  if (fullName !== undefined) user.fullName = fullName.trim();
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
  if (gender !== undefined) user.gender = gender;
  if (dob !== undefined) user.dob = dob;
  if (address !== undefined) user.address = { ...user.address, ...address };
  if (bio !== undefined) user.bio = bio;
  if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };
  if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };
  if (language !== undefined) user.language = language;
  if (timeZone !== undefined) user.timeZone = timeZone;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dob: user.dob,
      address: user.address,
      bio: user.bio,
      socialLinks: user.socialLinks,
      preferences: user.preferences,
      role: user.role,
      accountVerified: user.accountVerified,
    },
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findByIdAndDelete(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

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

export const sendOTP = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(ErrorHandlers("User not found", 404));

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = otp;
  user.verificationCodeExpire = otpExpire;
  await user.save();

  if (user.email) {
    await sendEmailOTP(user.email, otp);
  }

  res.status(200).json({
    success: true,
    message: "Verification code sent to your email",
  });
});

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(ErrorHandlers("OTP code is required", 400));

  const user = await User.findById(req.user._id);
  if (!user) return next(ErrorHandlers("User not found", 404));

  if (
    user.verificationCode !== String(otp).trim() ||
    new Date(user.verificationCodeExpire).getTime() < Date.now()
  ) {
    return next(ErrorHandlers("Invalid or expired OTP code", 400));
  }

  user.accountVerified = true;
  user.isEmailVerified = true;
  user.verificationCode = "";
  user.verificationCodeExpire = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Account verified successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      accountVerified: true,
    },
  });
});
