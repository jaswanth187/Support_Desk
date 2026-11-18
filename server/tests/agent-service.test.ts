import { beforeEach, describe, expect, it, vi } from "vitest";

import * as agentRepository from "../src/respositories/agent.repository.js";
import {
  getAllAgents,
  updateAgentStatus,
} from "../src/services/agent.service.js";

vi.mock("../src/respositories/agent.repository.js", () => ({
  getAgentsWithWorkloads: vi.fn(),
  getAgentById: vi.fn(),
  updateAgentStatus: vi.fn(),
}));

describe("agent services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates ticket workload by status and initializes empty workloads", async () => {
    vi.mocked(agentRepository.getAgentsWithWorkloads).mockResolvedValue({
      agents: [
        {
          id: "agent-1",
          name: "Agent One",
          email: "agent@example.com",
          createdAt: new Date("2025-01-01T00:00:00Z"),
          isActive: true,
        },
        {
          id: "agent-2",
          name: "Agent Two",
          email: "second@example.com",
          createdAt: new Date("2025-01-02T00:00:00Z"),
          isActive: true,
        },
      ],
      workloadGroups: [
        {
          assignedAgentId: "agent-1",
          status: "OPEN",
          _count: { _all: 2 },
        },
        {
          assignedAgentId: "agent-1",
          status: "IN_PROGRESS",
          _count: { _all: 1 },
        },
        {
          assignedAgentId: "deleted-agent",
          status: "OPEN",
          _count: { _all: 8 },
        },
        {
          assignedAgentId: null,
          status: "OPEN",
          _count: { _all: 4 },
        },
      ],
    });

    await expect(getAllAgents()).resolves.toMatchObject([
      {
        id: "agent-1",
        workload: {
          total: 3,
          byStatus: {
            OPEN: 2,
            IN_PROGRESS: 1,
            RESOLVED: 0,
            CLOSED: 0,
          },
        },
      },
      {
        id: "agent-2",
        workload: {
          total: 0,
          byStatus: {
            OPEN: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
            CLOSED: 0,
          },
        },
      },
    ]);
  });

  it("reports missing agents when status changes target a non-agent", async () => {
    vi.mocked(agentRepository.updateAgentStatus).mockResolvedValue(null);

    await expect(
      updateAgentStatus("not-an-agent", false, "admin-1")
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
