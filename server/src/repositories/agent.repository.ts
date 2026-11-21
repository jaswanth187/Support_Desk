import prisma from "../config/prisma.js";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
};

export const createAgent = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return prisma.user.create({
    data: {
      ...data,
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const getAgentsWithWorkloads = async () => {
  const [agents, workloadGroups] = await prisma.$transaction([
    prisma.user.findMany({
      where: {
        role: "AGENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.ticket.groupBy({
      by: ["assignedAgentId", "status"],
      where: {
        assignedAgentId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  return { agents, workloadGroups };
};

export const getAgentById = async (agentId: string) => {
  return prisma.user.findFirst({
    where: {
      id: agentId,
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      isActive: true,

      assignedTickets: {
        take: 10,
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      _count: {
        select: {
          assignedTickets: true,
        },
      },
    },
  });
};

export const updateAgentStatus = async (
  agentId: string,
  isActive: boolean,
  changedById: string
) => {
  return prisma.$transaction(async (tx) => {
    // Verify that the requested user is an agent.
    const agent = await tx.user.findFirst({
      where: {
        id: agentId,
        role: "AGENT",
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!agent) {
      return null;
    }

    // Update agent status.
    await tx.user.update({
      where: {
        id: agentId,
      },
      data: {
        isActive,
      },
    });

    let unassignedTickets = 0;

    if (!isActive) {
      // Revoke all active refresh tokens.
      await tx.refreshToken.updateMany({
        where: {
          userId: agentId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Find tickets that need reassignment.
      const tickets = await tx.ticket.findMany({
        where: {
          assignedAgentId: agentId,
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
        select: {
          id: true,
          assignedAgentId: true,
        },
      });

      // Unassign each ticket and record its history.
      for (const ticket of tickets) {
        const result = await tx.ticket.updateMany({
          where: {
            id: ticket.id,
            assignedAgentId: agentId,
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
          },
          data: {
            assignedAgentId: null,
          },
        });

        // Record history only if the ticket was actually updated.
        if (result.count === 1) {
          await tx.ticketHistory.create({
            data: {
              ticketId: ticket.id,
              changedById,
              oldAssignedAgentId: agentId,
              newAssignedAgentId: null,
            },
          });

          unassignedTickets++;
        }
      }
    }

    return {
      id: agentId,
      isActive,
      unassignedTickets,
    };
  });
};