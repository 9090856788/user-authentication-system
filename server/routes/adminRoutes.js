import express from "express";
import { isAuthenticated, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserByAdmin,
  changeUserRole,
  changeUserStatus,
  deleteUserByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// Enforce authentication and admin privileges on every admin route
router.use(isAuthenticated, requireAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUserByAdmin);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", changeUserStatus);
router.delete("/users/:id", deleteUserByAdmin);

export default router;
