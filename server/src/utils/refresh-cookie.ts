import type { CookieOptions } from "express";

const getBaseRefreshCookieOptions = (nodeEnv: string): CookieOptions => ({
  httpOnly: true,
  secure: nodeEnv === "production",
  sameSite: nodeEnv === "production" ? "none" : "lax",
  path: "/api/auth",
});

export const getRefreshCookieOptions = (
  nodeEnv: string,
  expiryDays: number
): CookieOptions => ({
  ...getBaseRefreshCookieOptions(nodeEnv),
  maxAge: expiryDays * 24 * 60 * 60 * 1000,
});

export const getRefreshCookieClearOptions = (
  nodeEnv: string
): CookieOptions => getBaseRefreshCookieOptions(nodeEnv);
