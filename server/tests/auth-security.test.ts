import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app";
import { createAuthRateLimiters } from "../src/middlwares/auth-rate-limit.middleware";
import {
  getRefreshCookieClearOptions,
  getRefreshCookieOptions,
} from "../src/utils/refresh-cookie";

const clientOrigin = "http://127.0.0.1:5173";

describe("authentication security controls", () => {
  it("limits login attempts from a single IP", async () => {
    const { loginIpLimiter } = createAuthRateLimiters({
      windowMs: 60_000,
      loginIpLimit: 2,
    });
    const limiterApp = express();
    limiterApp.use(express.json());
    limiterApp.post("/login", loginIpLimiter, (_req, res) => {
      res.status(401).json({ success: false });
    });

    const first = await request(limiterApp).post("/login").send({});
    const second = await request(limiterApp).post("/login").send({});
    const third = await request(limiterApp).post("/login").send({});

    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    expect(third.status).toBe(429);
  });

  it("limits repeated login attempts by account", async () => {
    const responses = [];

    for (let attempt = 0; attempt < 6; attempt++) {
      responses.push(
        await request(app)
          .post("/api/auth/login")
          .send({
            email: "login-limit@example.test",
            password: "",
          })
      );
    }

    expect(responses.slice(0, 5).every((response) => response.status === 400))
      .toBe(true);
    expect(responses[5].status).toBe(429);
  });

  it("limits repeated registration attempts by IP", async () => {
    const responses = [];

    for (let attempt = 0; attempt < 6; attempt++) {
      responses.push(
        await request(app)
          .post("/api/auth/register")
          .send({
            name: "x",
            email: "invalid",
            password: "x",
          })
      );
    }

    expect(responses.slice(0, 5).every((response) => response.status === 400))
      .toBe(true);
    expect(responses[5].status).toBe(429);
  });

  it("rejects refresh requests without the configured client origin", async () => {
    const crossSiteResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", "https://attacker.example")
      .send({});

    const missingOriginResponse = await request(app)
      .post("/api/auth/refresh")
      .send({});

    const sameOriginResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", clientOrigin)
      .send({});

    expect(crossSiteResponse.status).toBe(403);
    expect(missingOriginResponse.status).toBe(403);
    expect(sameOriginResponse.status).toBe(401);
  });

  it("restricts CORS response headers to the configured client origin", async () => {
    const allowedResponse = await request(app)
      .get("/api/health")
      .set("Origin", clientOrigin);
    const deniedResponse = await request(app)
      .get("/api/health")
      .set("Origin", "https://attacker.example");

    expect(allowedResponse.headers["access-control-allow-origin"])
      .toBe(clientOrigin);
    expect(allowedResponse.headers["access-control-allow-credentials"])
      .toBe("true");
    expect(deniedResponse.headers["access-control-allow-origin"])
      .toBe(clientOrigin);
  });

  it("uses production-safe and environment-appropriate refresh cookie flags", () => {
    const productionCookie = getRefreshCookieOptions("production", 7);
    const developmentCookie = getRefreshCookieOptions("development", 7);
    const clearCookie = getRefreshCookieClearOptions("production");

    expect(productionCookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    expect(developmentCookie).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/api/auth",
    });
    expect(clearCookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
    });
    expect(clearCookie).not.toHaveProperty("maxAge");
  });
});
