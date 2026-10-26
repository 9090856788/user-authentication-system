import cron from "node-cron";
import { User } from "../models/userSchema.js";

export const removeUnverifiedAccounts = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      await User.deleteMany({
        accountVerified: false,
        createdAt: { $lt: thirtyMinutesAgo },
      });
    } catch (err) {
      console.error("Cleanup job error:", err.message);
    }
  });
};
