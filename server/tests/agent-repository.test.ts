import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tx: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      updateMany: vi.fn(),
    },
    ticket: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    ticketHistory: {
      create: vi.fn(),
    },
  },
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/config/prisma.js", () => ({
  default: mocks.prisma,
}));

import { updateAgentStatus } from "../src/respositories/agent.repository.js";

describe("agent status repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(
      async (operation: (tx: typeof mocks.tx) => Promise<unknown>) =>
        operation(mocks.tx)
    );
  });

  it("revokes sessions and records only tickets successfully unassigned on deactivation", async () => {
    mocks.tx.user.findFirst.mockResolvedValue({
      id: "agent-1",
      isActive: true,
    });
    mocks.tx.ticket.findMany.mockResolvedValue([
      { id: "ticket-1", assignedAgentId: "agent-1" },
      { id: "ticket-2", assignedAgentId: "agent-1" },
    ]);
    mocks.tx.ticket.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    await expect(
      updateAgentStatus("agent-1", false, "admin-1")
    ).resolves.toMatchObject({
      id: "agent-1",
      isActive: false,
      unassignedTickets: 1,
    });

    expect(mocks.tx.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "agent-1", revokedAt: null },
      })
    );
    expect(mocks.tx.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          assignedAgentId: "agent-1",
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      })
    );
    expect(mocks.tx.ticketHistory.create).toHaveBeenCalledTimes(1);
    expect(mocks.tx.ticketHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          ticketId: "ticket-1",
          changedById: "admin-1",
          oldAssignedAgentId: "agent-1",
          newAssignedAgentId: null,
        },
      })
    );
  });

  it("does not mutate users who are not agents", async () => {
    mocks.tx.user.findFirst.mockResolvedValue(null);

    await expect(
      updateAgentStatus("customer-1", false, "admin-1")
    ).resolves.toBeNull();

    expect(mocks.tx.user.update).not.toHaveBeenCalled();
    expect(mocks.tx.refreshToken.updateMany).not.toHaveBeenCalled();
  });
});
