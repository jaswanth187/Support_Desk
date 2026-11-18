import type { Request, Response } from "express";

import {
  getAllAgents,
  getAgentDetails,
  updateAgentStatus,
} from "../services/agent.service.js";

import {AppError} from "../utils/app-error.js";
import { updateAgentStatusSchema } from "../validators/agent-status.validator.js";

export const getAgentsController = async (
  _req: Request,
  res: Response
) => {
  const agents = await getAllAgents();

  res.status(200).json({
    success: true,
    message: "Agents retrieved successfully",
    data: agents,
  });
};

export const getAgentByIdController = async (
  req: Request,
  res: Response
) => {
  const agentId = req.params.id;

  if (typeof agentId !=="string") {
    throw new AppError(400, "Agent ID is required");
  }

  const agent = await getAgentDetails(agentId);

  res.status(200).json({
    success: true,
    message: "Agent retrieved successfully",
    data: agent,
  });
};

export const updateAgentStatusController = async (
  req: Request,
  res: Response
) => {
  const agentId = req.params.id;

  if (typeof agentId !== "string" || !agentId.trim()) {
    throw new AppError(400, "Agent ID is required");
  }

  const parsed = updateAgentStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "Invalid agent status");
  }

  const agent = await updateAgentStatus(agentId, parsed.data.isActive, req.user!.id);

  res.status(200).json({
    success: true,
    message: "Agent status updated successfully",
    data: agent,
  });
};