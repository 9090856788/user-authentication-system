import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmailOTP } from "../utils/sendEmailOTP.js";

export const getMe = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(ErrorHandlers("User not found", 404));

  res.status(200).json({
    success: true,
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
      accountStatus: user.accountStatus,
      accountVerified: user.accountVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

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

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(ErrorHandlers("Current password and new password are required", 400));
  }

  if (newPassword.length < 8) {
    return next(ErrorHandlers("New password must be at least 8 characters long", 400));
  }

  const user = await User.findById(req.user._id);
  if (!user) return next(ErrorHandlers("User not found", 404));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(ErrorHandlers("Incorrect current password", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { password } = req.body || {};

  const user = await User.findById(userId);
  if (!user) return next(ErrorHandlers("User not found", 404));

  if (password) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ErrorHandlers("Incorrect password", 400));
    }
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (adminCount <= 1) {
      return next(ErrorHandlers("Cannot delete the only active administrator account", 400));
    }
  }

  await User.findByIdAndDelete(userId);

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
