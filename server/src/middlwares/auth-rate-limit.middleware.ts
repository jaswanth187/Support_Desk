import { createHash } from "node:crypto";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import type { Request } from "express";

interface AuthRateLimitOptions {
  windowMs?: number;
  loginIpLimit?: number;
  loginAccountLimit?: number;
  registrationLimit?: number;
}

const requestOriginFallbackKey = (req: Request) =>
  `ip:${ipKeyGenerator(req.ip ?? "unknown")}`;

export const createAuthRateLimiters = (
  options: AuthRateLimitOptions = {}
) => {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;

  const loginIpLimiter = rateLimit({
    windowMs,
    limit: options.loginIpLimit ?? 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many login attempts. Please try again later.",
    },
  });

  const loginAccountLimiter = rateLimit({
    windowMs,
    limit: options.loginAccountLimit ?? 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      const email = req.body?.email;
      if (typeof email !== "string" || !email.trim()) {
        return requestOriginFallbackKey(req);
      }

      const normalizedEmail = email.trim().toLowerCase();
      const accountKey = createHash("sha256")
        .update(normalizedEmail)
        .digest("hex");

      return `account:${accountKey}`;
    },
    message: {
      success: false,
      message: "Too many login attempts for this account. Please try again later.",
    },
  });

  const registrationLimiter = rateLimit({
    windowMs: options.windowMs ?? 60 * 60 * 1000,
    limit: options.registrationLimit ?? 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many registration attempts. Please try again later.",
    },
  });

  return {
    loginIpLimiter,
    loginAccountLimiter,
    registrationLimiter,
  };
};
