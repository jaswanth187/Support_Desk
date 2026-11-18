import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generate/prisma/client.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Hash development password
  const password = await bcrypt.hash("SupportDesk@123", 12);

  // 2. Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@supportdesk.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@supportdesk.com",
      password,
      role: "ADMIN",
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "priya@supportdesk.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@supportdesk.com",
      password,
      role: "AGENT",
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "rahul.agent@supportdesk.com" },
    update: {},
    create: {
      name: "Rahul Verma",
      email: "rahul.agent@supportdesk.com",
      password,
      role: "AGENT",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      name: "Amit Kumar",
      email: "customer1@example.com",
      password,
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      name: "Sneha Reddy",
      email: "customer2@example.com",
      password,
      role: "CUSTOMER",
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: "customer3@example.com" },
    update: {},
    create: {
      name: "Vikram Singh",
      email: "customer3@example.com",
      password,
      role: "CUSTOMER",
    },
  });

  console.log("✅ Users created");

  // 3. Create sample tickets
  const tickets = [
    {
      ticketNumber: "SD-1001",
      title: "Unable to login",
      description: "I cannot log into my account.",
      category: "Technical",
      priority: "HIGH" as const,
      status: "OPEN" as const,
      customer: customer1,
      agent: agent1,
    },
    {
      ticketNumber: "SD-1002",
      title: "Payment deducted twice",
      description: "I was charged twice for my subscription.",
      category: "Billing",
      priority: "URGENT" as const,
      status: "IN_PROGRESS" as const,
      customer: customer2,
      agent: agent1,
    },
    {
      ticketNumber: "SD-1003",
      title: "Unable to update profile",
      description: "Profile changes are not getting saved.",
      category: "Technical",
      priority: "MEDIUM" as const,
      status: "RESOLVED" as const,
      customer: customer3,
      agent: agent2,
    },
    {
      ticketNumber: "SD-1004",
      title: "Subscription cancellation",
      description: "I want to cancel my subscription.",
      category: "Account",
      priority: "LOW" as const,
      status: "CLOSED" as const,
      customer: customer1,
      agent: agent2,
    },
    {
      ticketNumber: "SD-1005",
      title: "Application loading slowly",
      description: "The dashboard takes too long to load.",
      category: "Technical",
      priority: "HIGH" as const,
      status: "OPEN" as const,
      customer: customer2,
      agent: null,
    },
  ];

  for (const ticket of tickets) {
    const createdTicket = await prisma.ticket.upsert({
      where: {
        ticketNumber: ticket.ticketNumber,
      },
      update: {},
      create: {
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,

        customer: {
          connect: { id: ticket.customer.id },
        },

        ...(ticket.agent && {
          assignedAgent: {
            connect: { id: ticket.agent.id },
          },
        }),

        ticketHistory: {
          create: {
            changedBy: {
              connect: {
                id: ticket.agent?.id ?? admin.id,
              },
            },
            oldStatus: null,
            newStatus: ticket.status,
            oldPriority: null,
            newPriority: ticket.priority,
          },
        },
      },
    });

    // Add an initial conversation for each ticket
    if (createdTicket) {
      await prisma.comment.createMany({
        data: [
          {
            ticketId: createdTicket.id,
            userId: ticket.customer.id,
            message: ticket.description,
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  console.log("✅ Sample tickets created");
  console.log("🎉 Database seeding completed!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });