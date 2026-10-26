import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^\+?[0-9]{7,15}$/.test(v.replace(/\s+/g, ""));
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dob: {
      type: Date,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: "en",
    },
    timeZone: {
      type: String,
      default: "UTC",
    },
    deviceInfo: {
      os: { type: String, default: "" },
      browser: { type: String, default: "" },
      ip: { type: String, default: "" },
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    verificationCodeExpire: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpire: {
      type: Date,
      default: Date.now,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    preferences: {
      theme: { type: String, default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password candidate with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
