import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tx: {
    ticket: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    ticketHistory: {
      create: vi.fn(),
    },
  },
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/config/prisma", () => ({
  default: mocks.prisma,
}));

import { assignTicket } from "../src/respositories/ticket.repository";

describe("ticket assignment repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(
      async (operation: (tx: typeof mocks.tx) => Promise<unknown>) =>
        operation(mocks.tx)
    );
  });

  it("does not reassign a closed ticket", async () => {
    mocks.tx.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
      assignedAgentId: "agent-1",
      status: "CLOSED",
    });

    await expect(
      assignTicket("ticket-1", "agent-2", "admin-1")
    ).resolves.toEqual({ kind: "CLOSED" });

    expect(mocks.tx.user.findFirst).not.toHaveBeenCalled();
    expect(mocks.tx.ticket.update).not.toHaveBeenCalled();
    expect(mocks.tx.ticketHistory.create).not.toHaveBeenCalled();
  });
});
