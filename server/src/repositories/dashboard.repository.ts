import {
  Prisma,
  UserRole,
} from "../../generate/prisma/client.js";

import prisma from "../config/prisma.js";

export const getDashboardData = async (
  userId: string,
  role: UserRole
) => {
  const where: Prisma.TicketWhereInput =
    role === "CUSTOMER"
      ? { customerId: userId }
      : role === "AGENT"
        ? { assignedAgentId: userId }
        : {};

  return prisma.$transaction(
    async (tx) => {
      const [
        totalTickets,
        statusBreakdown,
        priorityBreakdown,
        recentTickets,
      ] = await Promise.all([
        tx.ticket.count({ where }),

        tx.ticket.groupBy({
          by: ["status"],
          where,
          _count: {
            _all: true,
          },
        }),

        tx.ticket.groupBy({
          by: ["priority"],
          where,
          _count: {
            _all: true,
          },
        }),

        tx.ticket.findMany({
          where,
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            ticketNumber: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedAgent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

      let agentWorkloads = undefined;

      if (role === "ADMIN") {
        agentWorkloads = await tx.user.findMany({
          where: {
            role: "AGENT",
          },
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: {
                assignedTickets: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });
      }

      return {
        totalTickets,

        statusBreakdown: statusBreakdown.map((item) => ({
          status: item.status,
          count: item._count._all,
        })),

        priorityBreakdown: priorityBreakdown.map((item) => ({
          priority: item.priority,
          count: item._count._all,
        })),

        recentTickets,

        ...(role === "ADMIN" && {
          agentWorkloads: agentWorkloads?.map((agent) => ({
            id: agent.id,
            name: agent.name,
            email: agent.email,
            assignedTickets: agent._count.assignedTickets,
          })),
        }),
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    }
  );
};