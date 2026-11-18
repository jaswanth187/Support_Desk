import { randomBytes } from "node:crypto";
import * as ticketResposity from "../respositories/ticket.repository"
import type { CreateTicketInput } from "../validators/ticket.validator";
import type { Prisma, UserRole, TicketStatus,TicketPriority } from "../../generate/prisma/client"
import type { TicketQueryInput } from "../validators/ticket-query.validator";
import { AppError } from "../utils/app-error";

export const createCustomerTicket = async (data: CreateTicketInput, customerId: string) => {
    const suffix = randomBytes(4).toString("hex").toUpperCase();

    const ticketNumber = `SD-${Date.now()}-${suffix}`;
    return ticketResposity.createTicket(data, customerId, ticketNumber);
}

export const getTicketsForUser = async (
    userId: string,
    role: UserRole,
    filters: TicketQueryInput
) => {
    const where: Prisma.TicketWhereInput = {
        ...(role === "CUSTOMER" && {
            customerId: userId,
        }),

        ...(role === "AGENT" && {
            assignedAgentId: userId,
        }),

        ...(filters.status && {
            status: filters.status,
        }),

        ...(filters.priority && {
            priority: filters.priority,
        }),

        ...(filters.category && {
            category: filters.category,
        }),

        ...(filters.q && {
            OR: [
                {
                    ticketNumber: {
                        contains: filters.q,
                        mode: "insensitive",
                    },
                },
                {
                    title: {
                        contains: filters.q,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: filters.q,
                        mode: "insensitive",
                    },
                },
            ],
        }),
    };

    const skip = (filters.page - 1) * filters.limit;

    const orderBy: Prisma.TicketOrderByWithRelationInput = {
        [filters.sortBy]: filters.sortOrder,
    };

    const { tickets, total } = await ticketResposity.getTickets(
        where,
        skip,
        filters.limit,
        orderBy
    );

    return {
        tickets,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages: Math.ceil(total / filters.limit),
            hasNextPage: filters.page * filters.limit < total,
            hasPreviousPage: filters.page > 1,
        },
    };
};

export const getTicketDetails = async (
    ticketId: string,
    userId: string,
    role: UserRole
) => {
    const where: Prisma.TicketWhereInput = {
        id: ticketId,

        ...(role === 'CUSTOMER' && {
            customerId: userId,
        }),

        ...(role === "AGENT" && {
            assignedAgentId: userId,
        })
    }

    const ticket = await ticketResposity.getTicketById(where);

    if (!ticket) {
        throw new AppError(404, "Ticket not found");
    }

    return ticket;
}

export const buildTicketAccessWhere = (
    ticketId: string,
    userId: string,
    role: UserRole,
): Prisma.TicketWhereInput => ({
    id: ticketId,

    ...(role === "CUSTOMER" && ({
        customerId: userId,
    })),

    ...(role === "AGENT" && ({
        assignedAgentId: userId,
    }))
});

export const getCommentsForTicket = async (
    ticketId: string,
    userId: string,
    role: UserRole,
) => {
    const where = buildTicketAccessWhere(ticketId, userId, role);
    const result = await ticketResposity.getTicketComments(where);

    if (!result) {
        throw new AppError(404, "Ticket not found");
    }

    return result.comments;
};

export const addCommentToTicket = async (
    ticketId: string,
    userId: string,
    role: UserRole,
    message: string
) => {
    const where = buildTicketAccessWhere(ticketId, userId, role);

    const result = await ticketResposity.createTicketComment(where, userId, message);
    if (result.kind === "NOT_FOUND") {
        throw new AppError(404, "Ticket not found")
    }
    if (result.kind === "CLOSED") {
        throw new AppError(400, "Cannot comment on a closed ticket");
    }

    return result.comment;
}

export const assignTicketToAgent = async (
  ticketId: string,
  assignedAgentId: string | null,
  changedById: string
) => {
  const result = await ticketResposity.assignTicket(
    ticketId,
    assignedAgentId,
    changedById
  );

  if (result.kind === "NOT_FOUND") {
    throw new AppError(404, "Ticket not found");
  }

  if (result.kind === "INVALID_AGENT") {
    throw new AppError(404, "Agent not found");
  }

  if (result.kind === "CLOSED") {
    throw new AppError(400, "Closed tickets cannot be modified");
  }

  if (result.kind === "UNCHANGED") {
    throw new AppError(400, "Ticket already has this assignment");
  }

  return result.ticket;
};

const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["IN_PROGRESS", "CLOSED"],
  CLOSED: [],
};

export const changeTicketStatus = async (
  ticketId: string,
  userId: string,
  role: "ADMIN" | "AGENT",
  status: TicketStatus
) => {
  const result = await ticketResposity.updateTicketStatusWithHistory(
    ticketId,
    userId,
    role,
    status,
    allowedTransitions
  );

  if (result.kind === "NOT_FOUND") {
    throw new AppError(404, "Ticket not found");
  }

  if (result.kind === "INVALID_TRANSITION") {
    throw new AppError(400, "Invalid status transition");
  }

  return result.ticket;
};

export const changeTicketPriority = async (
  ticketId: string,
  userId: string,
  role: "ADMIN" | "AGENT",
  priority: TicketPriority
) => {
  const result = await ticketResposity.updateTicketPriorityWithHistory(
    ticketId,
    userId,
    role,
    priority
  );

  if (result.kind === "NOT_FOUND") {
    throw new AppError(404, "Ticket not found");
  }

  if (result.kind === "CLOSED") {
    throw new AppError(400, "Closed tickets cannot be modified");
  }

  if (result.kind === "UNCHANGED") {
    throw new AppError(400, "Priority is already set to this value");
  }

  return result.ticket;
};