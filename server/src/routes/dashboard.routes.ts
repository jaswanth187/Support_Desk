import { Router } from "express";

import { authenticate } from "../middlwares/authenticate";
import { getDashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", authenticate, getDashboardController);

export default router;