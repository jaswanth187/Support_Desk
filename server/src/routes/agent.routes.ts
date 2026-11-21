import { Router } from "express";

import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize.js";

import {
  createAgentController,
  getAgentsController,
  getAgentByIdController,
  updateAgentStatusController,
} from "../controllers/agent.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.post("/", createAgentController);
router.get("/", getAgentsController);
router.get("/:id", getAgentByIdController);
router.patch("/:id/status", updateAgentStatusController);

export default router;