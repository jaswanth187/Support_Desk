import type { TicketStatus } from "../../generate/prisma/client.js";

import * as agentRepository from "../respositories/agent.repository.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword } from "../utils/password.js";
import type { CreateAgentInput } from "../validators/agent.validator.js";

export const createAgent = async (input: CreateAgentInput) => {
  const existingUser = await agentRepository.findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists");
  }

  const password = await hashPassword(input.password);

  return agentRepository.createAgent({
    name: input.name,
    email: input.email,
    password,
  });
};

export const getAllAgents = async () => {
  const { agents, workloadGroups } =
    await agentRepository.getAgentsWithWorkloads();

  const workloads = new Map(
    agents.map((agent) => [
      agent.id,
      {
        total: 0,
        byStatus: {
          OPEN: 0,
          IN_PROGRESS: 0,
          RESOLVED: 0,
          CLOSED: 0,
        } as Record<TicketStatus, number>,
      },
    ])
  );

  for (const group of workloadGroups) {
    if (!group.assignedAgentId) continue;

    const workload = workloads.get(group.assignedAgentId);

    if (!workload) continue;

    const status = group.status;

    workload.total += group._count._all;
    workload.byStatus[status] += group._count._all;
  }

  return agents.map((agent) => ({
    ...agent,
    workload: workloads.get(agent.id),
  }));
};

export const getAgentDetails = async (agentId: string) => {
  const agent = await agentRepository.getAgentById(agentId);

  if (!agent) {
    throw new AppError(404, "Agent not found");
  }

  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    isActive: agent.isActive,
    createdAt: agent.createdAt,
    totalAssignedTickets: agent._count.assignedTickets,
    recentTickets: agent.assignedTickets,
  };
};

export const updateAgentStatus = async (
  agentId: string,
  isActive: boolean,
  changedById: string
) => {
  const updated = await agentRepository.updateAgentStatus(
    agentId,
    isActive,
    changedById
  );

  if (!updated) {
    throw new AppError(404, "Agent not found");
  }

  return updated;
};