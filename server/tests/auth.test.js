import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { User } from "../models/userSchema.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";

test("User Model & Password Security", async (t) => {
  await t.test("User document validates schema fields correctly", () => {
    const user = new User({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "TestPassword123!",
    });

    const error = user.validateSync();
    assert.equal(error, undefined, "Valid user document should produce no schema validation error");
    assert.equal(user.role, "user", "Default role must be 'user'");
    assert.equal(user.accountStatus, "active", "Default accountStatus must be 'active'");
  });

  await t.test("Schema rejects invalid email format", () => {
    const user = new User({
      fullName: "Test User",
      username: "testuser",
      email: "invalid-email-address",
      password: "TestPassword123!",
    });

    const error = user.validateSync();
    assert.ok(error && error.errors.email, "Schema should reject invalid email format");
  });

  await t.test("Password hashing and comparison utility", async () => {
    const rawPassword = "TestPassword123!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = new User({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });

    const isMatch = await user.comparePassword(rawPassword);
    assert.equal(isMatch, true, "comparePassword should return true for correct password");

    const isMismatch = await user.comparePassword("WrongPassword123!");
    assert.equal(isMismatch, false, "comparePassword should return false for incorrect password");
  });

  await t.test("OTP Generator produces 6-digit numeric string", () => {
    const otp = generateOTP();
    assert.equal(otp.length, 6, "OTP must be 6 digits");
    assert.match(otp, /^\d{6}$/, "OTP must be purely numeric");
  });

  await t.test("JWT token generation", () => {
    const testId = "usr_sample123";
    const access = generateAccessToken(testId);
    const refresh = generateRefreshToken(testId);

    assert.ok(access && typeof access === "string", "Access token must be generated");
    assert.ok(refresh && typeof refresh === "string", "Refresh token must be generated");
  });
});
