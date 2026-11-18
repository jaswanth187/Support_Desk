import { Router } from "express";

import { authenticate } from "../middlwares/authenticate";
import { authorize } from "../middlwares/authorize.js";

import {
  getAgentsController,
  getAgentByIdController,
  updateAgentStatusController,
} from "../controllers/agent.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", getAgentsController);
router.get("/:id", getAgentByIdController);
router.patch("/:id/status", updateAgentStatusController);

export default router;