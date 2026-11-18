import { Router } from "express";

import { authenticate } from "../middlwares/authenticate"
import { authorize } from "../middlwares/authorize";

const router = Router();

router.get("/profile", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Authenticated successfully",
    data: {
      user: req.user,
    },
  });
});

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/agent",
  authenticate,
  authorize("AGENT", "ADMIN"),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome Support Agent",
    });
  }
);

export default router;