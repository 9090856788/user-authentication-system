import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ✅ Define the User schema
const userSchema = new mongoose.Schema(
  {
    // Basic Info
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username can't exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
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
      minLength: [8, "Password must be at least 8 characters"],
      maxLength: [32, "Password can't exceed 32 characters"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    // Optional Personal Info
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
      maxlength: [500, "Bio can't exceed 500 characters"],
      default: "",
    },

    // Social Media Links
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // Account Settings
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

    // Security & Verification
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

    // User Preferences
    preferences: {
      theme: { type: String, default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ✅ Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Export the User model
export const User = mongoose.model("User", userSchema);
