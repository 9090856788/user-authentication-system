import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/userSchema.js";

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@example.com";
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "admin";
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "AdminPassword123!";

    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is required to seed administrator. Please configure MONGO_URI in your .env file.");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for admin provisioning.");

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.accountVerified = true;
      existingAdmin.accountStatus = "active";
      await existingAdmin.save();
      console.log(`Existing user ${adminUsername} promoted/verified as administrator.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        fullName: "System Administrator",
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        accountVerified: true,
        accountStatus: "active",
        phoneNumber: "+1234567890",
        bio: "Primary system administrator.",
      });
      console.log(`Administrator account created successfully for: ${adminEmail}`);
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(0);
  } catch (err) {
    console.error("Admin seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
