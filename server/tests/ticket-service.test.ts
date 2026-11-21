import { beforeEach, describe, expect, it, vi } from "vitest";

import * as ticketRepository from "../src/repositories/ticket.repository";
import {
  addCommentToTicket,
  assignTicketToAgent,
  changeTicketStatus,
  getTicketDetails,
  getTicketsForUser,
} from "../src/services/ticket.service";

vi.mock("../src/repositories/ticket.repository", () => ({
  createTicket: vi.fn(),
  getTickets: vi.fn(),
  getTicketById: vi.fn(),
  getTicketComments: vi.fn(),
  createTicketComment: vi.fn(),
  findAgentById: vi.fn(),
  assignTicket: vi.fn(),
  updateTicketStatusWithHistory: vi.fn(),
  updateTicketPriorityWithHistory: vi.fn(),
}));

describe("ticket services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes customer and agent ticket lists to their own records", async () => {
    vi.mocked(ticketRepository.getTickets).mockResolvedValue({
      tickets: [],
      total: 0,
    });
    const filters = {
      page: 2,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    } as const;

    await getTicketsForUser("customer-1", "CUSTOMER", filters);
    expect(ticketRepository.getTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ customerId: "customer-1" }),
      10,
      10,
      { createdAt: "desc" }
    );

    await getTicketsForUser("agent-1", "AGENT", filters);
    expect(ticketRepository.getTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ assignedAgentId: "agent-1" }),
      10,
      10,
      { createdAt: "desc" }
    );

    await getTicketsForUser("admin-1", "ADMIN", filters);
    const adminWhere = vi.mocked(ticketRepository.getTickets).mock.lastCall?.[0];
    expect(adminWhere).not.toHaveProperty("customerId");
    expect(adminWhere).not.toHaveProperty("assignedAgentId");
  });

  it("computes pagination metadata from the filtered result count", async () => {
    vi.mocked(ticketRepository.getTickets).mockResolvedValue({
      tickets: [],
      total: 21,
    });

    await expect(
      getTicketsForUser("customer-1", "CUSTOMER", {
        page: 2,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    ).resolves.toMatchObject({
      pagination: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });

  it("applies category, status, priority, and search filters together", async () => {
    vi.mocked(ticketRepository.getTickets).mockResolvedValue({
      tickets: [],
      total: 0,
    });

    await getTicketsForUser("customer-1", "CUSTOMER", {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      category: "Technical",
      status: "OPEN",
      priority: "HIGH",
      q: "login",
    });

    expect(ticketRepository.getTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer-1",
        category: "Technical",
        status: "OPEN",
        priority: "HIGH",
        OR: [
          { ticketNumber: { contains: "login", mode: "insensitive" } },
          { title: { contains: "login", mode: "insensitive" } },
          { description: { contains: "login", mode: "insensitive" } },
        ],
      }),
      0,
      10,
      { createdAt: "desc" }
    );
  });

  it("returns not-found for tickets outside a caller's scope", async () => {
    vi.mocked(ticketRepository.getTicketById).mockResolvedValue(null);

    await expect(
      getTicketDetails("ticket-1", "customer-1", "CUSTOMER")
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(ticketRepository.getTicketById).toHaveBeenCalledWith({
      id: "ticket-1",
      customerId: "customer-1",
    });
  });

  it("rejects comments on closed tickets without returning a successful comment", async () => {
    vi.mocked(ticketRepository.createTicketComment).mockResolvedValue({
      kind: "CLOSED",
    });

    await expect(
      addCommentToTicket("ticket-1", "customer-1", "CUSTOMER", "A reply")
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects assignment changes on closed tickets", async () => {
    vi.mocked(ticketRepository.assignTicket).mockResolvedValue({
      kind: "CLOSED",
    });

    await expect(
      assignTicketToAgent("ticket-1", "agent-2", "admin-1")
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Closed tickets cannot be modified",
    });
  });

  it("rejects invalid status transitions", async () => {
    vi.mocked(ticketRepository.updateTicketStatusWithHistory).mockResolvedValue({
      kind: "INVALID_TRANSITION",
    });

    await expect(
      changeTicketStatus("ticket-1", "agent-1", "AGENT", "CLOSED")
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(
      ticketRepository.updateTicketStatusWithHistory
    ).toHaveBeenCalledWith(
      "ticket-1",
      "agent-1",
      "AGENT",
      "CLOSED",
      expect.objectContaining({
        OPEN: ["IN_PROGRESS"],
        CLOSED: [],
      })
    );
  });
});
