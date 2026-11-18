import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../src/config/env";
import { errorMiddlware } from "../src/middlwares/error.middleware";
import { findUserAuthStatusById } from "../src/respositories/auth.repository";
import {
  getAllAgents,
  getAgentDetails,
  updateAgentStatus,
} from "../src/services/agent.service.js";

vi.mock("../src/respositories/auth.repository", () => ({
  findUserAuthStatusById: vi.fn(),
}));

vi.mock("../src/services/agent.service.js", () => ({
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

    vi.mocked(findUserAuthStatusById).mockResolvedValue({
      id: "agent-1",
      role: "AGENT",
      isActive: true,
    });

    await request(app)
      .get("/api/agents")
      .set("Authorization", `Bearer ${tokenFor("agent-1", "AGENT")}`)
      .expect(403);

    expect(getAllAgents).not.toHaveBeenCalled();
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
