import { Router } from "express";
import {
  forgotPassord,
  getCurrentUser,
  login,
  logout,
  register,
  resendEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = Router();

// Current user endpoint
router.get("/me", getCurrentUser);

// Register endpoint
router.post("/register", register);

// Login endpoint
router.post("/login", login);

// Verify email endpoint
router.put("/confirm-email", verifyEmail);

// Resend verification email endpoint
router.post("/resend-email", resendEmail);

// Forgot password endpoint
router.post("/forgot-password", forgotPassord);

// Reset password logic
router.put("/reset-password", resetPassword);

// Logout endpoint
router.get("/logout", logout);

export default router;
