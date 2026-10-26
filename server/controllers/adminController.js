import { User } from "../models/userSchema.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandlers } from "../middlewares/error.js";

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const verifiedUsers = await User.countDocuments({ accountVerified: true });
  const unverifiedUsers = await User.countDocuments({ accountVerified: false });
  const activeUsers = await User.countDocuments({ accountStatus: "active" });
  const suspendedUsers = await User.countDocuments({ accountStatus: "suspended" });
  const adminUsers = await User.countDocuments({ role: "admin" });

  const recentUsers = await User.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordExpire");

  const safeRecentUsers = recentUsers.map((u) => {
    const raw = typeof u.toObject === "function" ? u.toObject() : u;
    const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...safe } = raw;
    return safe;
  });

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      activeUsers,
      suspendedUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
    },
    recentUsers: safeRecentUsers,
  });
});

export const getUsers = catchAsyncError(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { search, role, status, accountVerified, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const query = {};

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { fullName: { $regex: escaped, $options: "i" } },
      { username: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  if (role && (role === "admin" || role === "user")) {
    query.role = role;
  }

  if (status && ["active", "inactive", "suspended"].includes(status)) {
    query.accountStatus = status;
  }

  if (accountVerified !== undefined && accountVerified !== "") {
    query.accountVerified = accountVerified === "true" || accountVerified === true;
  }

  const allowedSortFields = ["createdAt", "fullName", "email", "username", "lastLogin", "role", "accountStatus"];
  const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ [safeSortField]: sortDirection })
    .skip(skip)
    .limit(limit)
    .select("-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordExpire");

  const safeUsers = users.map((u) => {
    const raw = typeof u.toObject === "function" ? u.toObject() : u;
    const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...safe } = raw;
    return safe;
  });

  res.status(200).json({
    success: true,
    users: safeUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getUserById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select(
    "-password -verificationCode -verificationCodeExpire -resetPasswordToken -resetPasswordExpire"
  );

  if (!user) {
    return next(ErrorHandlers("User not found", 404));
  }

  const raw = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...safe } = raw;

  res.status(200).json({
    success: true,
    user: safe,
  });
});

export const updateUserByAdmin = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(ErrorHandlers("User not found", 404));
  }

  const { fullName, phoneNumber, gender, dob, address, bio, accountVerified } = req.body;

  if (fullName !== undefined) user.fullName = fullName.trim();
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
  if (gender !== undefined) user.gender = gender;
  if (dob !== undefined) user.dob = dob;
  if (address !== undefined) user.address = { ...user.address, ...address };
  if (bio !== undefined) user.bio = bio;
  if (accountVerified !== undefined) user.accountVerified = Boolean(accountVerified);

  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
      accountStatus: user.accountStatus,
      accountVerified: user.accountVerified,
    },
  });
});

export const changeUserRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["admin", "user"].includes(role)) {
    return next(ErrorHandlers("Valid role ('admin' or 'user') is required", 400));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(ErrorHandlers("User not found", 404));
  }

  // Prevent demoting the last active administrator
  if (targetUser.role === "admin" && role === "user") {
    const activeAdminCount = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (activeAdminCount <= 1) {
      return next(ErrorHandlers("Operation rejected: Cannot demote the last remaining active administrator.", 400));
    }
  }

  targetUser.role = role;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User role successfully updated to ${role}`,
    user: {
      id: targetUser._id,
      fullName: targetUser.fullName,
      email: targetUser.email,
      role: targetUser.role,
    },
  });
});

export const changeUserStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["active", "suspended", "inactive"].includes(status)) {
    return next(ErrorHandlers("Valid status ('active', 'suspended', 'inactive') is required", 400));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(ErrorHandlers("User not found", 404));
  }

  // Prevent an admin from suspending their own current session
  if (String(req.user._id) === String(targetUser._id) && status !== "active") {
    return next(ErrorHandlers("Self-lockout protection: You cannot suspend or deactivate your own admin account.", 400));
  }

  // Prevent suspending the last remaining administrator
  if (targetUser.role === "admin" && status !== "active") {
    const activeAdminCount = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (activeAdminCount <= 1) {
      return next(ErrorHandlers("Protection rule: Cannot suspend the last remaining active administrator.", 400));
    }
  }

  targetUser.accountStatus = status;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User status changed to ${status}`,
    user: {
      id: targetUser._id,
      fullName: targetUser.fullName,
      email: targetUser.email,
      accountStatus: targetUser.accountStatus,
    },
  });
});

export const deleteUserByAdmin = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (String(req.user._id) === String(id)) {
    return next(ErrorHandlers("Self-deletion protection: You cannot delete your own admin account while logged in.", 400));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(ErrorHandlers("User not found", 404));
  }

  // Protect the last active administrator
  if (targetUser.role === "admin") {
    const activeAdminCount = await User.countDocuments({ role: "admin", accountStatus: "active" });
    if (activeAdminCount <= 1) {
      return next(ErrorHandlers("Protection rule: Cannot delete the last remaining active administrator.", 400));
    }
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully by administrator",
  });
});
