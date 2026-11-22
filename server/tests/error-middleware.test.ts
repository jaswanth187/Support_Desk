import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { errorMiddleware } from "../src/middlewares/error.middleware";
import { AppError } from "../src/utils/app-error";

const app = express();
app.get("/known-error", () => {
  throw new AppError(422, "Invalid request");
});
app.get("/unexpected-error", () => {
  throw new Error("secret-bearing internal details");
});
app.use(errorMiddleware);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("error middleware", () => {
  it("preserves application error status and message", async () => {
    await request(app)
      .get("/known-error")
      .expect(422, { success: false, message: "Invalid request" });
  });

  it("returns a generic server error without logging exception details", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});

    await request(app)
      .get("/unexpected-error")
      .expect(500, {
        success: false,
        message: "Internal server error",
      });

    expect(logError).toHaveBeenCalledWith(
      "Unhandled application error:",
      "Error"
    );
  });
});
