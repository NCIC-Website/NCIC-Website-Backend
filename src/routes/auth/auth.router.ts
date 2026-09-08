import express from "express";
import {
  adminLogin, createUser, getAllUsers, updateUserStatus, deleteUser,
  changePassword, forgotPassword, resetPassword, getMe,
} from "./auth.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const router = express.Router();

// Public (with basic rate limiting applied in app.ts)
router.post("/admin-login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authenticated
router.get("/me", authenticate, getMe);
router.post("/change-password", authenticate, changePassword);

// SuperAdmin only 
router.post("/users", authenticate, requireRole("superAdmin"), createUser);
router.get("/users", authenticate, requireRole("superAdmin"), getAllUsers);
router.patch("/users/:id/status", authenticate, requireRole("superAdmin"), updateUserStatus);
router.delete("/users/:id", authenticate, requireRole("superAdmin"), deleteUser);

export default router;
