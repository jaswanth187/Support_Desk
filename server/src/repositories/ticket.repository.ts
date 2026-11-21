import { Prisma, type TicketStatus, type TicketPriority } from "../../generate/prisma/client";
import prisma from "../config/prisma";
import type { CreateTicketInput } from "../validators/ticket.validator"

export const createTicket = async (data: CreateTicketInput, customerId: string, ticketNumber: string) => {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        customerId,
      }
    })

    await tx.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: customerId,
        oldStatus: null,
        newStatus: ticket.status,
        oldPriority: null,
        newPriority: ticket.priority,
      }
    });

    return ticket;
  })
}

export const getTickets = async (where: Prisma.TicketWhereInput, skip: number, take: number, orderBy: Prisma.TicketOrderByWithRelationInput) => {

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        category: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    }),

    prisma.ticket.count({ where }),
  ])

  return { tickets, total }
}

export const getTicketById = async (
  where: Prisma.TicketWhereInput
) => {
  return prisma.ticket.findFirst({
    where,

    select: {
      id: true,
      ticketNumber: true,
      title: true,
      description: true,
      category: true,
      status: true,
      priority: true,
      customerId: true,
      assignedAgentId: true,
      createdAt: true,
      updatedAt: true,

      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignedAgent: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },

      comments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        }
      },

      ticketHistory: {
        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
          oldStatus: true,
          newStatus: true,
          oldPriority: true,
          newPriority: true,

          oldAssignedAgentId: true,
          newAssignedAgentId: true,

          oldAssignedAgent: {
            select: {
              id: true,
              name: true,
            },
          },

          newAssignedAgent: {
            select: {
              id: true,
              name: true,
            },
          },

          createdAt: true,

          changedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    }
  })
}

export const getTicketComments = async (where: Prisma.TicketWhereInput) => {
  return prisma.ticket.findFirst({
    where,
    select: {
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          }
        }
      }
    }
  })
}
// Create a comment after checking ticket access and status.
export const createTicketComment = async (
  where: Prisma.TicketWhereInput,
  userId: string,
  message: string
) => {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findFirst({
      where,
      select: {
        id: true,
        status: true,
      }
    })

    if (!ticket) {
      return { kind: "NOT_FOUND" as const };
    }

    if (ticket.status === "CLOSED") {
      return { kind: "CLOSED" as const };
    }

    const comment = await tx.comment.create({
      data: {
        message,
        ticketId: ticket.id,
        userId,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    return {
      kind: "CREATED" as const,
      comment,
    }
  })
}

export const findAgentById = async (agentId: string) => {
  return prisma.user.findFirst({
    where: {
      id: agentId,
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

export const assignTicket = async (
  ticketId: string,
  assignedAgentId: string | null,
  changedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        assignedAgentId: true,
        status: true,
      },
    });

    if (!ticket) {
      return { kind: "NOT_FOUND" as const };
    }

    if (ticket.status === "CLOSED") {
      return { kind: "CLOSED" as const };
    }

    if (ticket.assignedAgentId === assignedAgentId) {
      return { kind: "UNCHANGED" as const };
    }

    if (assignedAgentId !== null) {
      const agent = await tx.user.findFirst({
        where: {
          id: assignedAgentId,
          role: "AGENT",
          isActive: true,
        },
        select: { id: true },
      });

      if (!agent) {
        return { kind: "INVALID_AGENT" as const };
      }
    }

    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: { assignedAgentId },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        assignedAgentId: true,
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedAt: true,
      },
    });

    await tx.ticketHistory.create({
      data: {
        ticketId,
        changedById,
        oldAssignedAgentId: ticket.assignedAgentId,
        newAssignedAgentId: assignedAgentId,
      },
    });

    return {
      kind: "UPDATED" as const,
      ticket: updatedTicket,
    };
  });
};

export const updateTicketStatusWithHistory = async (
  ticketId: string,
  userId: string,
  role: "ADMIN" | "AGENT",
  newStatus: TicketStatus,
  allowedTransitions: Record<TicketStatus, TicketStatus[]>
) => {
  return prisma.$transaction(
    async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: {
          id: ticketId,
          ...(role === "AGENT" && {
            assignedAgentId: userId,
          }),
        },
      });

      if (!ticket) return { kind: "NOT_FOUND" as const };

      if (
        !allowedTransitions[ticket.status].includes(newStatus)
      ) {
        return { kind: "INVALID_TRANSITION" as const };
      }

      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId,
          changedById: userId,
          oldStatus: ticket.status,
          newStatus,
        },
      });

      return { kind: "UPDATED" as const, ticket: updated };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};

export const updateTicketPriorityWithHistory = async (
  ticketId: string,
  userId: string,
  role: "ADMIN" | "AGENT",
  newPriority: TicketPriority
) => {
  return prisma.$transaction(
    async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: {
          id: ticketId,
          ...(role === "AGENT" && {
            assignedAgentId: userId,
          }),
        },
      });

      if (!ticket) return { kind: "NOT_FOUND" as const };

      if (ticket.status === "CLOSED") {
        return { kind: "CLOSED" as const };
      }

      if (ticket.priority === newPriority) {
        return { kind: "UNCHANGED" as const };
      }

      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: { priority: newPriority },
      });

      await tx.ticketHistory.create({
        data: {
          ticketId,
          changedById: userId,
          oldPriority: ticket.priority,
          newPriority,
        },
      });

      return { kind: "UPDATED" as const, ticket: updated };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};