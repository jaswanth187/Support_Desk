import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller"
import { authenticate } from "../middlwares/authenticate";
import { createAuthRateLimiters } from "../middlwares/auth-rate-limit.middleware";
import { verifyClientOrigin } from "../middlwares/verify-client-origin.middleware";

const router = Router();
const {
  loginIpLimiter,
  loginAccountLimiter,
  registrationLimiter,
} = createAuthRateLimiters();

router.post("/register", registrationLimiter, register);
router.post("/login", loginIpLimiter, loginAccountLimiter, login);
router.post("/refresh", verifyClientOrigin, refresh);
router.post('/logout',authenticate,logout);

router.get("/me",authenticate,getMe);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;