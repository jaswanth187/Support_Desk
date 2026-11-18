import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import app from "../src/app";
import prisma from "../src/config/prisma";
import { hashPassword } from "../src/utils/password";
import { hashRefreshToken } from "../src/utils/token";

const clientOrigin = "http://127.0.0.1:5173";
const password = "Integration-test-password-1";
const marker = `predeploy-${crypto.randomUUID()}`;

interface TestUser {
  id: string;
  email: string;
}

interface AuthSession {
  userId: string;
  accessToken: string;
  refreshCookie: string;
}

const createdUserIds: string[] = [];

const createUser = async (
  role: "CUSTOMER" | "ADMIN" | "AGENT",
  name: string,
  email: string
): Promise<TestUser> => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
    },
  });

  createdUserIds.push(user.id);
  return user;
};

const getRefreshCookie = (response: request.Response) => {
  const cookie = response.headers["set-cookie"]?.[0];
  if (!cookie) {
    throw new Error("Authentication response did not set a refresh cookie.");
  }
  return cookie.split(";")[0];
};

const authenticate = async (
  email: string,
  userPassword = password
): Promise<AuthSession> => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("Origin", clientOrigin)
    .send({ email, password: userPassword })
    .expect(200);

  return {
    userId: response.body.data.user.id,
    accessToken: response.body.data.accessToken,
    refreshCookie: getRefreshCookie(response),
  };
};

const withAuth = (accessToken: string) => ({
  get: (path: string) =>
    request(app).get(path).set("Authorization", `Bearer ${accessToken}`),
  post: (path: string) =>
    request(app).post(path).set("Authorization", `Bearer ${accessToken}`),
  patch: (path: string) =>
    request(app).patch(path).set("Authorization", `Bearer ${accessToken}`),
});

const createTicket = async (
  accessToken: string,
  title: string
): Promise<{ id: string }> => {
  const response = await withAuth(accessToken)
    .post("/api/tickets")
    .send({
      title,
      description: `Integration details for ${title}`,
      category: "QA",
      priority: "MEDIUM",
    })
    .expect(201);

  return response.body.data;
};

const updateStatus = async (
  accessToken: string,
  ticketId: string,
  status: "IN_PROGRESS" | "RESOLVED" | "CLOSED"
) => {
  await withAuth(accessToken)
    .patch(`/api/tickets/${ticketId}/status`)
    .send({ status })
    .expect(200);
};

describe("PostgreSQL-backed SupportDesk workflows", () => {
  let customer: TestUser;
  let admin: TestUser;
  let agent: TestUser;
  let profileUser: TestUser;

  beforeAll(async () => {
    await prisma.$connect();

    customer = await createUser(
      "CUSTOMER",
      "Integration Customer",
      `${marker}-customer@example.test`
    );
    admin = await createUser(
      "ADMIN",
      "Integration Admin",
      `${marker}-admin@example.test`
    );
    agent = await createUser(
      "AGENT",
      "Integration Agent",
      `${marker}-agent@example.test`
    );
    profileUser = await createUser(
      "CUSTOMER",
      "Profile Customer",
      `${marker}-profile@example.test`
    );
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.ticket.deleteMany({
        where: { customerId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }

    await prisma.$disconnect();
  });

  it("runs ticket history and deactivation workflow through the API", async () => {
    const customerSession = await authenticate(customer.email);
    const initialRefreshToken = customerSession.refreshCookie.split("=")[1];

    const refreshResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", clientOrigin)
      .set("Cookie", customerSession.refreshCookie)
      .send({})
      .expect(200);

    const rotatedCustomerSession: AuthSession = {
      ...customerSession,
      accessToken: refreshResponse.body.data.accessToken,
      refreshCookie: getRefreshCookie(refreshResponse),
    };

    const [oldCustomerToken, newCustomerToken] = await Promise.all([
      prisma.refreshToken.findUnique({
        where: { tokenHash: hashRefreshToken(initialRefreshToken) },
      }),
      prisma.refreshToken.findUnique({
        where: {
          tokenHash: hashRefreshToken(
            rotatedCustomerSession.refreshCookie.split("=")[1]
          ),
        },
      }),
    ]);

    expect(oldCustomerToken?.revokedAt).not.toBeNull();
    expect(newCustomerToken?.revokedAt).toBeNull();

    const adminSession = await authenticate(admin.email);
    const agentSession = await authenticate(agent.email);
    const ticketOpen = await createTicket(
      rotatedCustomerSession.accessToken,
      `${marker} open ticket`
    );
    const ticketInProgress = await createTicket(
      rotatedCustomerSession.accessToken,
      `${marker} in progress ticket`
    );
    const ticketResolved = await createTicket(
      rotatedCustomerSession.accessToken,
      `${marker} resolved ticket`
    );
    const ticketClosed = await createTicket(
      rotatedCustomerSession.accessToken,
      `${marker} closed ticket`
    );
    const ticketIds = [
      ticketOpen.id,
      ticketInProgress.id,
      ticketResolved.id,
      ticketClosed.id,
    ];

    for (const ticketId of ticketIds) {
      await withAuth(adminSession.accessToken)
        .patch(`/api/tickets/${ticketId}/assignment`)
        .send({ assignedAgentId: agent.id })
        .expect(200);
    }

    await withAuth(agentSession.accessToken)
      .patch(`/api/tickets/${ticketOpen.id}/priority`)
      .send({ priority: "HIGH" })
      .expect(200);

    await updateStatus(
      agentSession.accessToken,
      ticketInProgress.id,
      "IN_PROGRESS"
    );

    await updateStatus(agentSession.accessToken, ticketResolved.id, "IN_PROGRESS");
    await updateStatus(agentSession.accessToken, ticketResolved.id, "RESOLVED");

    await updateStatus(agentSession.accessToken, ticketClosed.id, "IN_PROGRESS");
    await updateStatus(agentSession.accessToken, ticketClosed.id, "RESOLVED");
    await updateStatus(agentSession.accessToken, ticketClosed.id, "CLOSED");

    const commentResponse = await withAuth(agentSession.accessToken)
      .post(`/api/tickets/${ticketOpen.id}/comments`)
      .send({ message: "Database-backed integration comment." })
      .expect(201);
    expect(commentResponse.body.data.message)
      .toBe("Database-backed integration comment.");

    const detailsResponse = await withAuth(rotatedCustomerSession.accessToken)
      .get(`/api/tickets/${ticketOpen.id}`)
      .expect(200);
    expect(detailsResponse.body.data.ticketHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          oldPriority: "MEDIUM",
          newPriority: "HIGH",
        }),
        expect.objectContaining({
          oldAssignedAgentId: null,
          newAssignedAgentId: agent.id,
        }),
      ])
    );

    const agentRefreshToken = agentSession.refreshCookie.split("=")[1];
    const deactivationResponse = await withAuth(adminSession.accessToken)
      .patch(`/api/agents/${agent.id}/status`)
      .send({ isActive: false })
      .expect(200);
    expect(deactivationResponse.body.data.unassignedTickets).toBe(2);

    const agentTokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(agentRefreshToken) },
    });
    expect(agentTokenRecord?.revokedAt).not.toBeNull();

    await request(app)
      .post("/api/auth/refresh")
      .set("Origin", clientOrigin)
      .set("Cookie", agentSession.refreshCookie)
      .send({})
      .expect(401);

    const ticketsAfterDeactivation = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: {
        id: true,
        status: true,
        assignedAgentId: true,
      },
    });
    const ticketsById = new Map(
      ticketsAfterDeactivation.map((ticket) => [ticket.id, ticket])
    );

    expect(ticketsById.get(ticketOpen.id)).toMatchObject({
      status: "OPEN",
      assignedAgentId: null,
    });
    expect(ticketsById.get(ticketInProgress.id)).toMatchObject({
      status: "IN_PROGRESS",
      assignedAgentId: null,
    });
    expect(ticketsById.get(ticketResolved.id)).toMatchObject({
      status: "RESOLVED",
      assignedAgentId: agent.id,
    });
    expect(ticketsById.get(ticketClosed.id)).toMatchObject({
      status: "CLOSED",
      assignedAgentId: agent.id,
    });

    const deactivationHistory = await prisma.ticketHistory.findMany({
      where: {
        ticketId: { in: ticketIds },
        oldAssignedAgentId: agent.id,
        newAssignedAgentId: null,
      },
    });
    expect(deactivationHistory.map((entry) => entry.ticketId).sort())
      .toEqual([ticketOpen.id, ticketInProgress.id].sort());

    const assignedHistory = await prisma.ticketHistory.findMany({
      where: {
        ticketId: { in: ticketIds },
        oldAssignedAgentId: null,
        newAssignedAgentId: agent.id,
      },
    });
    expect(assignedHistory).toHaveLength(4);

    const statusHistory = await prisma.ticketHistory.findMany({
      where: {
        ticketId: { in: ticketIds },
        oldStatus: { not: null },
        newStatus: { not: null },
      },
      select: {
        ticketId: true,
        oldStatus: true,
        newStatus: true,
      },
    });
    expect(statusHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ticketId: ticketInProgress.id,
          oldStatus: "OPEN",
          newStatus: "IN_PROGRESS",
        }),
        expect.objectContaining({
          ticketId: ticketResolved.id,
          oldStatus: "IN_PROGRESS",
          newStatus: "RESOLVED",
        }),
        expect.objectContaining({
          ticketId: ticketClosed.id,
          oldStatus: "RESOLVED",
          newStatus: "CLOSED",
        }),
      ])
    );
  });

  it("updates a profile and changes password with refresh-session revocation", async () => {
    const profileSession = await authenticate(profileUser.email);

    const profileResponse = await withAuth(profileSession.accessToken)
      .patch("/api/auth/profile")
      .send({
        name: "Updated Profile Customer",
        email: `${marker}-profile-updated@example.test`,
      })
      .expect(200);

    expect(profileResponse.body.data).toMatchObject({
      name: "Updated Profile Customer",
      email: `${marker}-profile-updated@example.test`,
    });

    await withAuth(profileSession.accessToken)
      .patch("/api/auth/change-password")
      .send({
        currentPassword: password,
        newPassword: "Updated-integration-password-2",
      })
      .expect(200);

    const userRefreshTokens = await prisma.refreshToken.findMany({
      where: { userId: profileUser.id },
    });
    expect(userRefreshTokens.length).toBeGreaterThan(0);
    expect(userRefreshTokens.every((token) => token.revokedAt !== null))
      .toBe(true);

    await request(app)
      .post("/api/auth/refresh")
      .set("Origin", clientOrigin)
      .set("Cookie", profileSession.refreshCookie)
      .send({})
      .expect(401);

    await request(app)
      .post("/api/auth/login")
      .set("Origin", clientOrigin)
      .send({
        email: profileUser.email,
        password: "Updated-integration-password-2",
      })
      .expect(401);

    await request(app)
      .post("/api/auth/login")
      .set("Origin", clientOrigin)
      .send({
        email: `${marker}-profile-updated@example.test`,
        password: "Updated-integration-password-2",
      })
      .expect(200);
  });
});
