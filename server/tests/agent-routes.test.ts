import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../src/config/env";
import { errorMiddlware } from "../src/middlwares/error.middleware";
import { findUserAuthStatusById } from "../src/respositories/auth.repository";
import { AppError } from "../src/utils/app-error";
import {
  createAgent,
  getAllAgents,
  getAgentDetails,
  updateAgentStatus,
} from "../src/services/agent.service.js";

vi.mock("../src/respositories/auth.repository", () => ({
  findUserAuthStatusById: vi.fn(),
}));

vi.mock("../src/services/agent.service.js", () => ({
  createAgent: vi.fn(),
  getAllAgents: vi.fn(),
  getAgentDetails: vi.fn(),
  updateAgentStatus: vi.fn(),
}));

import agentRoutes from "../src/routes/agent.routes.js";

const app = express();
app.use(express.json());
app.use("/api/agents", agentRoutes);
app.use(errorMiddlware);

const tokenFor = (id: string, role: "ADMIN" | "AGENT" | "CUSTOMER") =>
  jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    subject: id,
    expiresIn: "5m",
    algorithm: "HS256",
  });

describe("agent management routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication and admin authorization", async () => {
    await request(app).get("/api/agents").expect(401);
    await request(app).post("/api/agents").send({}).expect(401);

    vi.mocked(findUserAuthStatusById).mockResolvedValue({
      id: "agent-1",
      role: "AGENT",
      isActive: true,
    });

    await request(app)
      .get("/api/agents")
      .set("Authorization", `Bearer ${tokenFor("agent-1", "AGENT")}`)
      .expect(403);

    await request(app)
      .post("/api/agents")
      .set("Authorization", `Bearer ${tokenFor("agent-1", "AGENT")}`)
      .send({})
      .expect(403);

    expect(getAllAgents).not.toHaveBeenCalled();
    expect(createAgent).not.toHaveBeenCalled();
  });

  it("validates agent creation and ignores client-supplied roles", async () => {
    vi.mocked(findUserAuthStatusById).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(createAgent).mockResolvedValue({
      id: "agent-1",
      name: "New Agent",
      email: "new@example.com",
      isActive: true,
      createdAt: new Date("2025-01-01T00:00:00Z"),
    });

    const adminToken = tokenFor("admin-1", "ADMIN");

    await request(app)
      .post("/api/agents")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "N",
        email: "invalid",
        password: "short",
      })
      .expect(400);

    const response = await request(app)
      .post("/api/agents")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: " New Agent ",
        email: " NEW@Example.com ",
        password: "secure-password",
        role: "ADMIN",
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      id: "agent-1",
      name: "New Agent",
      email: "new@example.com",
    });
    expect(createAgent).toHaveBeenCalledWith({
      name: "New Agent",
      email: "new@example.com",
      password: "secure-password",
    });
  });

  it("returns a conflict when the agent email is already in use", async () => {
    vi.mocked(findUserAuthStatusById).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(createAgent).mockRejectedValue(
      new AppError(409, "An account with this email already exists")
    );

    const response = await request(app)
      .post("/api/agents")
      .set("Authorization", `Bearer ${tokenFor("admin-1", "ADMIN")}`)
      .send({
        name: "Existing Agent",
        email: "existing@example.com",
        password: "secure-password",
      })
      .expect(409);

    expect(response.body.message).toBe(
      "An account with this email already exists"
    );
  });

  it("validates and applies an admin agent status change", async () => {
    vi.mocked(findUserAuthStatusById).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(updateAgentStatus).mockResolvedValue({
      id: "agent-1",
      isActive: false,
      unassignedTickets: 2,
    });

    await request(app)
      .patch("/api/agents/agent-1/status")
      .set("Authorization", `Bearer ${tokenFor("admin-1", "ADMIN")}`)
      .send({ isActive: "false" })
      .expect(400);

    const response = await request(app)
      .patch("/api/agents/agent-1/status")
      .set("Authorization", `Bearer ${tokenFor("admin-1", "ADMIN")}`)
      .send({ isActive: false })
      .expect(200);

    expect(response.body.data).toEqual({
      id: "agent-1",
      isActive: false,
      unassignedTickets: 2,
    });
    expect(updateAgentStatus).toHaveBeenCalledWith(
      "agent-1",
      false,
      "admin-1"
    );
  });
});
