import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../src/config/env";
import { authenticate } from "../src/middlewares/authenticate";
import { errorMiddlware } from "../src/middlewares/error.middleware";
import { findUserAuthStatusById } from "../src/repositories/auth.repository";

vi.mock("../src/repositories/auth.repository", () => ({
  findUserAuthStatusById: vi.fn(),
}));

const findAuthStatus = vi.mocked(findUserAuthStatusById);

const app = express();
app.get("/private", authenticate, (req, res) => {
  res.json({ user: req.user });
});
app.use(errorMiddlware);

const createToken = (
  id: string,
  role: "ADMIN" | "AGENT" | "CUSTOMER",
  secret = env.JWT_ACCESS_SECRET
) =>
  jwt.sign({ role }, secret, {
    subject: id,
    expiresIn: "5m",
    algorithm: "HS256",
  });

describe("authentication middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing and invalid bearer tokens", async () => {
    await request(app).get("/private").expect(401);
    await request(app)
      .get("/private")
      .set("Authorization", `Bearer ${createToken("user-1", "CUSTOMER", "wrong-secret")}`)
      .expect(401);

    expect(findAuthStatus).not.toHaveBeenCalled();
  });

  it("rejects a token whose role no longer matches the user record", async () => {
    findAuthStatus.mockResolvedValue({
      id: "user-1",
      role: "CUSTOMER",
      isActive: true,
    });

    await request(app)
      .get("/private")
      .set("Authorization", `Bearer ${createToken("user-1", "ADMIN")}`)
      .expect(401);
  });

  it("blocks deactivated agents and attaches active user identity", async () => {
    findAuthStatus.mockResolvedValue({
      id: "agent-1",
      role: "AGENT",
      isActive: false,
    });

    await request(app)
      .get("/private")
      .set("Authorization", `Bearer ${createToken("agent-1", "AGENT")}`)
      .expect(403);

    findAuthStatus.mockResolvedValue({
      id: "customer-1",
      role: "CUSTOMER",
      isActive: true,
    });

    const response = await request(app)
      .get("/private")
      .set("Authorization", `Bearer ${createToken("customer-1", "CUSTOMER")}`)
      .expect(200);

    expect(response.body.user).toEqual({
      id: "customer-1",
      role: "CUSTOMER",
    });
  });
});
