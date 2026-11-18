import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tx: {
    ticket: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/config/prisma.js", () => ({
  default: mocks.prisma,
}));

import { getDashboardData } from "../src/respositories/dashboard.respository.js";

describe("dashboard repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(
      async (operation: (tx: typeof mocks.tx) => Promise<unknown>) =>
        operation(mocks.tx)
    );
    mocks.tx.ticket.count.mockResolvedValue(3);
    mocks.tx.ticket.groupBy.mockImplementation(async ({ by }: { by: string[] }) =>
      by[0] === "status"
        ? [{ status: "OPEN", _count: { _all: 2 } }]
        : [{ priority: "HIGH", _count: { _all: 3 } }]
    );
    mocks.tx.ticket.findMany.mockResolvedValue([]);
    mocks.tx.user.findMany.mockResolvedValue([
      {
        id: "agent-1",
        name: "Agent One",
        email: "agent@example.com",
        _count: { assignedTickets: 2 },
      },
    ]);
  });

  it("limits customer dashboard data to that customer's tickets", async () => {
    const data = await getDashboardData("customer-1", "CUSTOMER");

    expect(mocks.tx.ticket.count).toHaveBeenCalledWith({
      where: { customerId: "customer-1" },
    });
    expect(data).toMatchObject({
      totalTickets: 3,
      statusBreakdown: [{ status: "OPEN", count: 2 }],
      priorityBreakdown: [{ priority: "HIGH", count: 3 }],
    });
    expect(data).not.toHaveProperty("agentWorkloads");
    expect(mocks.tx.user.findMany).not.toHaveBeenCalled();
  });

  it("limits agent dashboard data to assigned tickets and includes workloads only for admins", async () => {
    await getDashboardData("agent-1", "AGENT");
    expect(mocks.tx.ticket.count).toHaveBeenLastCalledWith({
      where: { assignedAgentId: "agent-1" },
    });
    expect(mocks.tx.user.findMany).not.toHaveBeenCalled();

    const adminData = await getDashboardData("admin-1", "ADMIN");
    expect(mocks.tx.ticket.count).toHaveBeenLastCalledWith({ where: {} });
    expect(mocks.tx.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: "AGENT" } })
    );
    expect(adminData).toMatchObject({
      agentWorkloads: [
        {
          id: "agent-1",
          name: "Agent One",
          assignedTickets: 2,
        },
      ],
    });
  });
});
